import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import { verifyMembershipApprovalToken } from "@/lib/membership-approval-token";
import prisma from "@/lib/prisma";
import { ApproveMembershipForm } from "./ApproveMembershipForm";
import Loading from "@/app/loading";
import { getEtransferInstructions } from "@/lib/membership-etransfer";
import { Button } from "@/components/ui/button";

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

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    const loginHref = `/login?redirect=${encodeURIComponent(`/admin/approve-membership?token=${token}`)}`;
    return (
      <div className="container mx-auto p-8 max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
        <p className="text-muted-foreground">
          Approval links identify the applicant. Sign in with a JOCA staff
          account to approve or reject.
        </p>
        <Button asChild>
          <Link href={loginHref}>Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!isJocaAdminEmail(session.user.email)) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center">
        <h1 className="text-2xl font-semibold mb-2">Not authorized</h1>
        <p className="text-muted-foreground">
          This account cannot review membership applications. Use a JOCA admin
          email, or open Applications from the staff dashboard.
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
      etransferEnabled={Boolean(getEtransferInstructions())}
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
