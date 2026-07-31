import Stripe from "stripe";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import {
  getPlanLabel,
  isMembershipPlanId,
  type MembershipPlanId,
} from "@/lib/membership-plans";
import { EMAIL_FROM, resend } from "@/lib/resend";
import { MembershipApprovedTemplate } from "@/components/emails/MembershipApprovedTemplate";
import { MembershipRejectedTemplate } from "@/components/emails/MembershipRejectedTemplate";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

function appBaseUrl(): string {
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
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
 */
export async function createMembershipCheckoutUrl(params: {
  userId: string;
  planId: MembershipPlanId;
}): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
  });
  if (!user) throw new Error("User not found");

  const customerId = await ensureStripeCustomer(user);
  const priceId = await resolvePriceId(params.planId);

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
        plan: params.planId,
        stripeCustomerId: customerId,
        status: "incomplete",
        stripeSubscriptionId: null,
        updatedAt: new Date(),
      },
    });
    subscriptionId = existing.id;
  } else {
    subscriptionId = randomUUID();
    await prisma.subscription.create({
      data: {
        id: subscriptionId,
        plan: params.planId,
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

  if (resend) {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Your JOCA membership was approved — complete payment",
      react: MembershipApprovedTemplate({
        username: user.firstName || user.name,
        planLabel: getPlanLabel(params.planId),
        checkoutUrl,
      }),
    });
  } else {
    console.warn(
      `[membership] Resend not configured; checkout URL for ${user.email}: ${checkoutUrl}`,
    );
  }

  return { checkoutUrl };
}

export async function rejectMembershipApplication(params: {
  userId: string;
}): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user) throw new Error("User not found");

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
