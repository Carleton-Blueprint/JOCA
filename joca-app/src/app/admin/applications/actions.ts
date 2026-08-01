"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import {
  approveMembershipApplication,
  confirmEtransferPayment,
  rejectMembershipApplication,
} from "@/lib/membership-checkout";
import { isMembershipPlanId } from "@/lib/membership-plans";

export type AdminActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

async function requireAdmin(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!isJocaAdminEmail(session.user.email)) {
    return { ok: false, message: "You are not authorized to manage applications." };
  }
  return { ok: true };
}

export async function adminApproveApplicationAction(
  formData: FormData,
): Promise<AdminActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const userId = String(formData.get("userId") ?? "");
  const planId = String(formData.get("planId") ?? "");

  if (!userId) return { ok: false, message: "Missing applicant id." };
  if (!isMembershipPlanId(planId)) {
    return { ok: false, message: "Please select a valid membership plan." };
  }

  try {
    await approveMembershipApplication({ userId, planId });
    revalidatePath("/admin/applications");
    return {
      ok: true,
      message:
        "Application approved. Payment options have been emailed to the member.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to approve application.",
    };
  }
}

export async function adminRejectApplicationAction(
  formData: FormData,
): Promise<AdminActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing applicant id." };

  try {
    await rejectMembershipApplication({ userId });
    revalidatePath("/admin/applications");
    return {
      ok: true,
      message: "Application rejected. The member has been notified.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to reject application.",
    };
  }
}

export async function adminConfirmEtransferAction(
  formData: FormData,
): Promise<AdminActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { ok: false, message: "Missing applicant id." };

  try {
    await confirmEtransferPayment({ userId });
    revalidatePath("/admin/applications");
    return {
      ok: true,
      message: "Interac e-Transfer confirmed. Membership is active.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to confirm e-Transfer payment.",
    };
  }
}
