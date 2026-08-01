import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";
import { getEtransferInstructions } from "@/lib/membership-etransfer";
import { ApplicationCard } from "./ApplicationCard";
import Loading from "@/app/loading";

async function ApplicationsDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  if (!isJocaAdminEmail(session.user.email)) redirect("/");

  const users = await prisma.user.findMany({
    where: {
      emailVerified: true,
      OR: [
        { membershipStatus: MEMBERSHIP_STATUS.PENDING_APPROVAL },
        { membershipStatus: MEMBERSHIP_STATUS.APPROVED },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      requestedPlan: true,
      approvedPlan: true,
      membershipStatus: true,
      createdAt: true,
    },
  });

  const activeSubs = await prisma.subscription.findMany({
    where: {
      referenceId: { in: users.map((u) => u.id) },
      status: "active",
    },
    select: { referenceId: true },
  });
  const activeUserIds = new Set(activeSubs.map((s) => s.referenceId));

  const applicants = users
    .map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      requestedPlan: user.requestedPlan,
      approvedPlan: user.approvedPlan,
      membershipStatus: user.membershipStatus,
      createdAt: user.createdAt.toISOString(),
      hasActiveSubscription: activeUserIds.has(user.id),
    }))
    .filter(
      (user) =>
        user.membershipStatus === MEMBERSHIP_STATUS.PENDING_APPROVAL ||
        (user.membershipStatus === MEMBERSHIP_STATUS.APPROVED &&
          !user.hasActiveSubscription),
    );

  const pendingCount = applicants.filter(
    (a) => a.membershipStatus === MEMBERSHIP_STATUS.PENDING_APPROVAL,
  ).length;
  const awaitingPaymentCount = applicants.filter(
    (a) => a.membershipStatus === MEMBERSHIP_STATUS.APPROVED,
  ).length;

  const etransferEnabled = Boolean(getEtransferInstructions());

  return (
    <div
      className={
        applicants.length === 1
          ? "container mx-auto max-w-lg space-y-8 p-8"
          : "container mx-auto max-w-5xl space-y-8 p-8"
      }
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Membership applications</h1>
        <p className="text-muted-foreground">
          Review pending signups and confirm Interac e-Transfer payments.
        </p>
        <p className="text-sm text-muted-foreground">
          {pendingCount} awaiting review
          {awaitingPaymentCount > 0
            ? ` · ${awaitingPaymentCount} awaiting payment`
            : ""}
          {" · "}
          <Link
            href="/admin/members"
            className="underline underline-offset-2"
          >
            Manage members
          </Link>
        </p>
      </header>

      {applicants.length === 0 ? (
        <p className="text-muted-foreground">
          No applications need attention right now.
        </p>
      ) : (
        <div
          className={
            applicants.length === 1 ? undefined : "grid gap-6 md:grid-cols-2"
          }
        >
          {applicants.map((applicant) => (
            <ApplicationCard
              key={applicant.id}
              applicant={applicant}
              etransferEnabled={etransferEnabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplicationsDashboard />
    </Suspense>
  );
}
