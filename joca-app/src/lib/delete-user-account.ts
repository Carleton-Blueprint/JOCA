import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Cancel Stripe billing, remove the Stripe customer, and delete the local
 * subscription row. Call this before deleting the Prisma user row.
 */
export async function cleanupUserExternalData(user: {
  id: string;
  email: string;
}): Promise<void> {
  const [sub, dbUser] = await Promise.all([
    prisma.subscription.findUnique({
      where: { referenceId: user.id },
      select: {
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        status: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    }),
  ]);

  // Cancel Stripe first whenever a live subscription id exists.
  // Abort if cancel fails so billing cannot outlive the user.
  if (sub) {
    const shouldCancelStripe =
      Boolean(sub.stripeSubscriptionId) &&
      sub.status !== "canceled" &&
      sub.status !== "ended";

    if (shouldCancelStripe && sub.stripeSubscriptionId) {
      try {
        await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId);
      } catch (error) {
        console.error(
          `[BILLING ALERT] Stripe cancellation failed for user ${user.id}. ` +
            `Aborting account deletion. Stripe subscription ${sub.stripeSubscriptionId}.`,
          error,
        );
        throw new Error(
          "Unable to cancel your Stripe subscription. Please try again or contact support.",
        );
      }
    }
  }

  // Remove the Stripe customer so payment methods and the customer
  // record do not linger in the Dashboard after account deletion.
  const stripeCustomerId =
    dbUser?.stripeCustomerId || sub?.stripeCustomerId || null;
  if (stripeCustomerId) {
    try {
      await stripeClient.customers.del(stripeCustomerId);
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? (error as { code?: string }).code
          : undefined;
      // Already gone in Stripe — safe to continue account deletion.
      if (code !== "resource_missing") {
        console.error(
          `[BILLING ALERT] Stripe customer delete failed for user ${user.id}. ` +
            `Aborting account deletion. Stripe customer ${stripeCustomerId}.`,
          error,
        );
        throw new Error(
          "Unable to delete your Stripe customer. Please try again or contact support.",
        );
      }
    }
  }

  if (sub) {
    try {
      await prisma.subscription.delete({
        where: { referenceId: user.id },
      });
    } catch (error) {
      console.error(
        `Failed to delete subscription record for user ${user.id}:`,
        error,
      );
      throw error;
    }
  }
}

/**
 * Full account wipe: external cleanup, then delete the user row.
 * Session / account / vote / subscription rows cascade via FK.
 */
export async function deleteUserAccountCompletely(user: {
  id: string;
  email: string;
}): Promise<void> {
  await cleanupUserExternalData(user);
  await prisma.user.delete({ where: { id: user.id } });
}
