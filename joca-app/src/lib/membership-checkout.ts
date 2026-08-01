import Stripe from "stripe";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import {
  getPlanLabel,
  isMembershipPlanId,
  type MembershipPlanId,
  MEMBERSHIP_STATUS,
} from "@/lib/membership-plans";
import { EMAIL_FROM, resend } from "@/lib/resend";
import { MembershipApprovedTemplate } from "@/components/emails/MembershipApprovedTemplate";
import { MembershipRejectedTemplate } from "@/components/emails/MembershipRejectedTemplate";
import { MembershipActivatedTemplate } from "@/components/emails/MembershipActivatedTemplate";
import { getEtransferInstructions } from "@/lib/membership-etransfer";
import { isEmailVerificationSkipped } from "@/lib/email-verification";

/** Marker on Subscription.billingInterval for manual Interac e-Transfer memberships. */
export const ETRANSFER_BILLING_INTERVAL = "etransfer";

/** Stripe Customer metadata flag: e-Transfer already activated this membership. */
export const STRIPE_ETRANSFER_ACTIVE_META = "joca_etransfer_active";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

function appBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function expireOpenCheckoutSessions(customerId: string): Promise<void> {
  const sessions = await stripeClient.checkout.sessions.list({
    customer: customerId,
    status: "open",
    limit: 100,
  });
  for (const session of sessions.data) {
    try {
      await stripeClient.checkout.sessions.expire(session.id);
    } catch (error) {
      console.warn(
        `[membership] Failed to expire Checkout session ${session.id}:`,
        error,
      );
    }
  }
}

async function cancelIncompleteStripeSubscriptions(
  customerId: string,
): Promise<void> {
  for await (const sub of stripeClient.subscriptions.list({
    customer: customerId,
    status: "incomplete",
    limit: 100,
  })) {
    try {
      await stripeClient.subscriptions.cancel(sub.id);
    } catch (error) {
      console.warn(
        `[membership] Failed to cancel incomplete Stripe subscription ${sub.id}:`,
        error,
      );
    }
  }
}

async function setStripeEtransferActiveFlag(
  customerId: string,
  active: boolean,
): Promise<void> {
  await stripeClient.customers.update(customerId, {
    metadata: {
      [STRIPE_ETRANSFER_ACTIVE_META]: active ? "1" : "",
    },
  });
}

/**
 * If e-Transfer already activated membership, cancel a late Stripe sub and
 * restore the Prisma row. Called from Better Auth onSubscriptionComplete
 * after the plugin may have overwritten the row.
 */
export async function recoverEtransferAfterStripeCheckout(params: {
  referenceId: string;
  stripeSubscriptionId: string;
  stripeCustomerId?: string | null;
}): Promise<boolean> {
  let etransferActive = false;

  if (params.stripeCustomerId) {
    try {
      const customer = await stripeClient.customers.retrieve(
        params.stripeCustomerId,
      );
      if (
        !customer.deleted &&
        customer.metadata?.[STRIPE_ETRANSFER_ACTIVE_META] === "1"
      ) {
        etransferActive = true;
      }
    } catch (error) {
      console.warn(
        `[membership] Could not read Stripe customer for e-Transfer race check:`,
        error,
      );
    }
  }

  const existing = await prisma.subscription.findUnique({
    where: { referenceId: params.referenceId },
  });

  if (
    !etransferActive &&
    existing?.billingInterval !== ETRANSFER_BILLING_INTERVAL
  ) {
    return false;
  }

  try {
    await stripeClient.subscriptions.cancel(params.stripeSubscriptionId);
  } catch (error) {
    console.error(
      `[membership] Failed to cancel Stripe subscription after e-Transfer race:`,
      error,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: params.referenceId },
    select: { approvedPlan: true },
  });
  const plan =
    (user?.approvedPlan && isMembershipPlanId(user.approvedPlan)
      ? user.approvedPlan
      : existing?.plan) ?? existing?.plan;

  if (!plan) return true;

  const now = new Date();
  await prisma.subscription.update({
    where: { referenceId: params.referenceId },
    data: {
      plan,
      status: "active",
      stripeSubscriptionId: null,
      billingInterval: ETRANSFER_BILLING_INTERVAL,
      periodStart: existing?.periodStart ?? now,
      periodEnd: null,
      cancelAtPeriodEnd: false,
      cancelAt: null,
      canceledAt: null,
      endedAt: null,
      seats: null,
      stripeScheduleId: null,
      updatedAt: now,
    },
  });

  console.warn(
    `[membership] Restored e-Transfer membership for ${params.referenceId} after late Stripe Checkout.`,
  );
  return true;
}

async function ensureStripeCustomer(user: {
  id: string;
  email: string;
  name: string;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripeClient.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
      customerType: "user",
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

async function resolvePriceId(planId: MembershipPlanId): Promise<string> {
  const prices = await stripeClient.prices.list({
    lookup_keys: [planId],
    active: true,
    limit: 1,
  });
  const price = prices.data[0];
  if (!price) {
    throw new Error(`No active Stripe price found for lookup key: ${planId}`);
  }
  return price.id;
}

/**
 * Creates (or reuses) an incomplete Subscription row and a Stripe Checkout
 * Session using the same metadata contract as @better-auth/stripe so webhooks
 * activate membership correctly.
 *
 * Always requires staff approval and charges only the staff-approved plan.
 * Optional `planId` must match `user.approvedPlan` when provided.
 */
export async function createMembershipCheckoutUrl(params: {
  userId: string;
  planId?: MembershipPlanId;
}): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });
  if (!user) throw new Error("User not found");

  if (user.membershipStatus !== MEMBERSHIP_STATUS.APPROVED) {
    throw new Error(
      "Membership application must be approved before checkout.",
    );
  }

  if (!user.approvedPlan || !isMembershipPlanId(user.approvedPlan)) {
    throw new Error("Approved plan is missing; cannot start checkout.");
  }

  if (params.planId && params.planId !== user.approvedPlan) {
    throw new Error("Checkout plan does not match the approved membership plan.");
  }

  if (!user.emailVerified && !isEmailVerificationSkipped()) {
    throw new Error("Email must be verified before checkout.");
  }

  const planId = user.approvedPlan;
  const customerId = await ensureStripeCustomer(user);
  await setStripeEtransferActiveFlag(customerId, false);
  const priceId = await resolvePriceId(planId);

  const existing = await prisma.subscription.findUnique({
    where: { referenceId: user.id },
  });

  if (existing?.status === "active") {
    throw new Error("User already has an active subscription");
  }

  let subscriptionId: string;
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: planId,
        stripeCustomerId: customerId,
        status: "incomplete",
        stripeSubscriptionId: null,
        billingInterval: null,
        updatedAt: new Date(),
      },
    });
    subscriptionId = existing.id;
  } else {
    subscriptionId = randomUUID();
    await prisma.subscription.create({
      data: {
        id: subscriptionId,
        plan: planId,
        referenceId: user.id,
        stripeCustomerId: customerId,
        status: "incomplete",
      },
    });
  }

  const base = appBaseUrl();
  const metadata = {
    userId: user.id,
    subscriptionId,
    referenceId: user.id,
  };

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/payment/success`,
    cancel_url: `${base}/payment/cancel`,
    metadata,
    subscription_data: { metadata },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout Session did not return a URL");
  }

  return session.url;
}

export async function approveMembershipApplication(params: {
  userId: string;
  planId: string;
}): Promise<{ checkoutUrl: string }> {
  if (!isMembershipPlanId(params.planId)) {
    throw new Error("Invalid membership plan");
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) throw new Error("User not found");

  if (
    user.membershipStatus === MEMBERSHIP_STATUS.APPROVED ||
    user.membershipStatus === MEMBERSHIP_STATUS.REJECTED
  ) {
    throw new Error(
      "This application has already been decided and cannot be changed.",
    );
  }

  const active = await prisma.subscription.findFirst({
    where: { referenceId: user.id, status: "active" },
  });
  if (active) {
    throw new Error("User already has an active membership");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      approvedPlan: params.planId,
      membershipStatus: MEMBERSHIP_STATUS.APPROVED,
    },
  });

  const checkoutUrl = await createMembershipCheckoutUrl({
    userId: user.id,
    planId: params.planId,
  });

  const etransfer = getEtransferInstructions();

  if (resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Your JOCA membership was approved — complete payment",
      react: MembershipApprovedTemplate({
        username: user.firstName || user.name,
        planLabel: getPlanLabel(params.planId),
        checkoutUrl,
        etransferEmail: etransfer?.email,
        etransferNotes: etransfer?.notes,
        etransferSecurityQuestion: etransfer?.securityQuestion,
        etransferSecurityAnswer: etransfer?.securityAnswer,
      }),
    });
  } else {
    console.warn(
      `[membership] Resend not configured; skipped approval email for user ${user.id}.`,
    );
  }

  return { checkoutUrl };
}

export async function rejectMembershipApplication(params: {
  userId: string;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) throw new Error("User not found");

  if (
    user.membershipStatus === MEMBERSHIP_STATUS.APPROVED ||
    user.membershipStatus === MEMBERSHIP_STATUS.REJECTED
  ) {
    throw new Error(
      "This application has already been decided and cannot be changed.",
    );
  }

  const active = await prisma.subscription.findFirst({
    where: { referenceId: user.id, status: "active" },
  });
  if (active) {
    throw new Error("Cannot reject a user with an active membership");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      membershipStatus: MEMBERSHIP_STATUS.REJECTED,
      approvedPlan: null,
    },
  });

  if (resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Update on your JOCA membership application",
      react: MembershipRejectedTemplate({
        username: user.firstName || user.name,
      }),
    });
  }
}

/**
 * Staff confirms an Interac e-Transfer was received and activates membership
 * without a Stripe subscription (not visible in Stripe Dashboard).
 */
export async function confirmEtransferPayment(params: {
  userId: string;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) throw new Error("User not found");

  if (user.membershipStatus !== MEMBERSHIP_STATUS.APPROVED) {
    throw new Error(
      "Application must be approved before confirming an e-Transfer payment.",
    );
  }

  if (!user.approvedPlan || !isMembershipPlanId(user.approvedPlan)) {
    throw new Error("Approved plan is missing; cannot activate membership.");
  }

  const existing = await prisma.subscription.findUnique({
    where: { referenceId: user.id },
  });

  if (existing?.status === "active") {
    throw new Error("User already has an active membership");
  }

  // Prevent a parallel Stripe Checkout from activating after e-Transfer.
  if (user.stripeCustomerId) {
    await expireOpenCheckoutSessions(user.stripeCustomerId);
    await cancelIncompleteStripeSubscriptions(user.stripeCustomerId);
    await setStripeEtransferActiveFlag(user.stripeCustomerId, true);
  }

  const now = new Date();
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: user.approvedPlan,
        status: "active",
        stripeSubscriptionId: null,
        billingInterval: ETRANSFER_BILLING_INTERVAL,
        periodStart: now,
        periodEnd: null,
        cancelAtPeriodEnd: false,
        cancelAt: null,
        canceledAt: null,
        endedAt: null,
        updatedAt: now,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        id: randomUUID(),
        plan: user.approvedPlan,
        referenceId: user.id,
        status: "active",
        billingInterval: ETRANSFER_BILLING_INTERVAL,
        periodStart: now,
        stripeCustomerId: user.stripeCustomerId,
      },
    });
  }

  if (resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Your JOCA membership is now active",
      react: MembershipActivatedTemplate({
        username: user.firstName || user.name,
        planLabel: getPlanLabel(user.approvedPlan),
      }),
    });
  }
}
