import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import prisma from "@/lib/prisma";
import { isEmailUnverified } from "@/lib/email-verification";
import { MEMBERSHIP_STATUS, getPlanLabel } from "@/lib/membership-plans";
import Loading from "../loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function PendingContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <NotLoggedIn />;

  if (isEmailUnverified(session.user)) return <EmailNotVerified />;

  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });
  if (activeSubscription) redirect("/payment/success");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      membershipStatus: true,
      requestedPlan: true,
      approvedPlan: true,
    },
  });

  if (user?.membershipStatus === MEMBERSHIP_STATUS.APPROVED) {
    redirect("/payment");
  }

  const isRejected = user?.membershipStatus === MEMBERSHIP_STATUS.REJECTED;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {isRejected
              ? "Application not approved"
              : "Application pending review"}
          </CardTitle>
          <CardDescription>
            {isRejected
              ? "JOCA was unable to approve your membership application at this time."
              : "Thanks for verifying your email. JOCA is reviewing your application."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRejected && (
            <>
              <p className="text-sm text-muted-foreground">
                Suggested membership:{" "}
                <strong>{getPlanLabel(user?.requestedPlan)}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Once approved, you will receive an email with a secure Stripe
                payment link. After payment, you will gain access to elections
                and membership management.
              </p>
            </>
          )}
          {isRejected && (
            <p className="text-sm text-muted-foreground">
              If you believe this is a mistake, please contact JOCA directly.
            </p>
          )}
          <Button asChild variant="outline">
            <Link href="/account">Go to account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PendingContent />
    </Suspense>
  );
}
