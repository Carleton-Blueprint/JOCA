"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createMembershipCheckoutUrl } from "@/lib/membership-checkout";

export type StartCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string };

/**
 * Staff-gated Stripe Checkout for the caller's approved plan.
 * Prefer this over Better Auth `subscription.upgrade` (blocked in auth hooks).
 */
export async function startMembershipCheckoutAction(): Promise<StartCheckoutResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, message: "You must be logged in to pay." };
  }

  try {
    const checkoutUrl = await createMembershipCheckoutUrl({
      userId: session.user.id,
    });
    return { ok: true, checkoutUrl };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again.",
    };
  }
}
