"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import { verifyMembershipApprovalToken } from "@/lib/membership-approval-token";
import {
  approveMembershipApplication,
  rejectMembershipApplication,
} from "@/lib/membership-checkout";
import { isMembershipPlanId } from "@/lib/membership-plans";

export type ApproveActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * Token identifies the applicant; a signed-in JOCA admin is required to act.
 * E-Transfer confirmation is only available on /admin/applications (session admin).
 */
async function requireTokenAndAdmin(
  token: string,
): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const verified = verifyMembershipApprovalToken(token);
  if (!verified) {
    return {
      ok: false,
      message: "This approval link is invalid or has expired.",
    };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      ok: false,
      message: "Sign in with a JOCA admin account to review this application.",
    };
  }
  if (!isJocaAdminEmail(session.user.email)) {
    return {
      ok: false,
      message: "You are not authorized to review membership applications.",
    };
  }

  return { ok: true, userId: verified.userId };
}

export async function approveMembershipAction(
  formData: FormData,
): Promise<ApproveActionResult> {
  const token = String(formData.get("token") ?? "");
  const planId = String(formData.get("planId") ?? "");

  const gate = await requireTokenAndAdmin(token);
  if (!gate.ok) return gate;

  if (!isMembershipPlanId(planId)) {
    return { ok: false, message: "Please select a valid membership plan." };
  }

  try {
    await approveMembershipApplication({
      userId: gate.userId,
      planId,
    });
    return {
      ok: true,
      message:
        "Application approved. Payment options (card and Interac e-Transfer, if configured) have been emailed to the member.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to approve application.";
    return { ok: false, message };
  }
}

export async function rejectMembershipAction(
  formData: FormData,
): Promise<ApproveActionResult> {
  const token = String(formData.get("token") ?? "");

  const gate = await requireTokenAndAdmin(token);
  if (!gate.ok) return gate;

  try {
    await rejectMembershipApplication({ userId: gate.userId });
    return {
      ok: true,
      message: "Application rejected. The member has been notified by email.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to reject application.";
    return { ok: false, message };
  }
}
