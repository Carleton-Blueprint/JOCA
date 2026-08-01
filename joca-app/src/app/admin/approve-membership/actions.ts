"use server";

import { verifyMembershipApprovalToken } from "@/lib/membership-approval-token";
import {
  approveMembershipApplication,
  confirmEtransferPayment,
  rejectMembershipApplication,
} from "@/lib/membership-checkout";
import { isMembershipPlanId } from "@/lib/membership-plans";

export type ApproveActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function approveMembershipAction(
  formData: FormData,
): Promise<ApproveActionResult> {
  const token = String(formData.get("token") ?? "");
  const planId = String(formData.get("planId") ?? "");

  const verified = verifyMembershipApprovalToken(token);
  if (!verified) {
    return {
      ok: false,
      message: "This approval link is invalid or has expired.",
    };
  }

  if (!isMembershipPlanId(planId)) {
    return { ok: false, message: "Please select a valid membership plan." };
  }

  try {
    await approveMembershipApplication({
      userId: verified.userId,
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

  const verified = verifyMembershipApprovalToken(token);
  if (!verified) {
    return {
      ok: false,
      message: "This approval link is invalid or has expired.",
    };
  }

  try {
    await rejectMembershipApplication({ userId: verified.userId });
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

export async function confirmEtransferAction(
  formData: FormData,
): Promise<ApproveActionResult> {
  const token = String(formData.get("token") ?? "");

  const verified = verifyMembershipApprovalToken(token);
  if (!verified) {
    return {
      ok: false,
      message: "This approval link is invalid or has expired.",
    };
  }

  try {
    await confirmEtransferPayment({ userId: verified.userId });
    return {
      ok: true,
      message:
        "Interac e-Transfer confirmed. Membership is active and the member has been notified.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to confirm e-Transfer payment.";
    return { ok: false, message };
  }
}
