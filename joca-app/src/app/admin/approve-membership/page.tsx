import { Suspense } from "react";
import { verifyMembershipApprovalToken } from "@/lib/membership-approval-token";
import prisma from "@/lib/prisma";
import { ApproveMembershipForm } from "./ApproveMembershipForm";
import Loading from "@/app/loading";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

async function ApproveMembershipContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-2">Missing approval link</h1>
        <p className="text-muted-foreground">
          Open the review link from the JOCA membership application email.
        </p>
      </div>
    );
  }

  const verified = verifyMembershipApprovalToken(token);
  if (!verified) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-2">Invalid or expired link</h1>
        <p className="text-muted-foreground">
          This approval link is invalid or has expired. Ask the member to
          re-verify their email, or request a fresh notification from the team.
        </p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      requestedPlan: true,
      approvedPlan: true,
      membershipStatus: true,
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-2">Applicant not found</h1>
        <p className="text-muted-foreground">
          This user account no longer exists.
        </p>
      </div>
    );
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: verified.userId, status: "active" },
    select: { id: true },
  });

  return (
    <ApproveMembershipForm
      token={token}
      applicant={user}
      hasActiveSubscription={Boolean(activeSubscription)}
    />
  );
}

export default function ApproveMembershipPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <ApproveMembershipContent searchParams={searchParams} />
    </Suspense>
  );
}
