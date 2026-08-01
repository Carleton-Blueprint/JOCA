import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isEmailUnverified } from "@/lib/email-verification";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";
import { isJocaAdminEmail } from "@/lib/joca-admin";

export type MembershipTodo =
  | "review_application"
  | "complete_payment"
  | null;

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({
      active: false,
      stripeBilling: false,
      todo: null as MembershipTodo,
      isAdmin: false,
      pendingApplicationCount: 0,
    });
  }

  const userId = session.user.id;
  const email = session.user.email;

  const [activeSubscription, dbUser] = await Promise.all([
    prisma.subscription.findFirst({
      where: { referenceId: userId, status: "active" },
      select: { id: true, stripeSubscriptionId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        membershipStatus: true,
        approvedPlan: true,
      },
    }),
  ]);

  const active = Boolean(activeSubscription);
  const stripeBilling = Boolean(activeSubscription?.stripeSubscriptionId);

  let todo: MembershipTodo = null;
  if (!isEmailUnverified(dbUser ?? session.user) && !active) {
    if (dbUser?.membershipStatus === MEMBERSHIP_STATUS.PENDING_APPROVAL) {
      todo = "review_application";
    } else if (
      dbUser?.membershipStatus === MEMBERSHIP_STATUS.APPROVED &&
      dbUser.approvedPlan
    ) {
      todo = "complete_payment";
    }
  }

  const isAdmin = isJocaAdminEmail(email);
  let pendingApplicationCount = 0;
  if (isAdmin) {
    // Match /admin/applications: pending review + approved but unpaid.
    pendingApplicationCount = await prisma.user.count({
      where: {
        emailVerified: true,
        OR: [
          { membershipStatus: MEMBERSHIP_STATUS.PENDING_APPROVAL },
          {
            membershipStatus: MEMBERSHIP_STATUS.APPROVED,
            NOT: { subscription: { is: { status: "active" } } },
          },
        ],
      },
    });
  }

  return NextResponse.json({
    active,
    stripeBilling,
    todo,
    isAdmin,
    pendingApplicationCount,
  });
}

