import prisma from "@/lib/prisma";
import { EMAIL_FROM, resend } from "@/lib/resend";
import { getApproveMembershipUrl } from "@/lib/membership-approval-token";
import { getPlanLabel } from "@/lib/membership-plans";
import { MembershipApplicationStaffTemplate } from "@/components/emails/MembershipApplicationStaffTemplate";

/**
 * Notify JOCA staff that a verified (or skip-verification) signup needs approval.
 * Safe to call more than once; staff email is sent each time verification completes.
 */
export async function notifyJocaOfMembershipApplication(
  userId: string,
): Promise<void> {
  const approvalsEmail = process.env.JOCA_APPROVALS_EMAIL;
  if (!approvalsEmail) {
    console.warn(
      "[membership] JOCA_APPROVALS_EMAIL is not set; skipping staff notification.",
    );
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      requestedPlan: true,
    },
  });

  if (!user) return;

  const approveUrl = getApproveMembershipUrl(user.id);

  if (!resend) {
    console.warn(
      `[membership] Resend not configured; skipped staff notification for user ${user.id} (${user.email}).`,
    );
    return;
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: approvalsEmail,
      subject: `New JOCA membership application: ${user.firstName} ${user.lastName}`,
      react: MembershipApplicationStaffTemplate({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        requestedPlanLabel: getPlanLabel(user.requestedPlan),
        approveUrl,
      }),
    });
  } catch (error) {
    console.error(
      `[membership] Failed to notify JOCA of application for user ${userId}:`,
      error,
    );
  }
}
