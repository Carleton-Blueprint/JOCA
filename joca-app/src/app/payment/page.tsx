import { Suspense } from "react";
import { StartPaymentPage } from "./StartPaymentPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import prisma from "@/lib/prisma";
import { isEmailUnverified } from "@/lib/email-verification";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";
import { getEtransferInstructions } from "@/lib/membership-etransfer";
import Loading from "../loading";

async function PaymentGate() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  if (isEmailUnverified(session.user)) return <EmailNotVerified />;

  // "active" covers the grace period (Stripe keeps status active until periodEnd even after cancellation).
  // If trials are added in future, also include status: "trialing".
  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });
  if (activeSubscription) redirect("/payment/success");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { membershipStatus: true, approvedPlan: true },
  });

  if (
    user?.membershipStatus !== MEMBERSHIP_STATUS.APPROVED ||
    !user.approvedPlan
  ) {
    redirect("/pending");
  }

  const etransfer = getEtransferInstructions();

  return (
    <StartPaymentPage
      approvedPlan={user.approvedPlan}
      etransferEmail={etransfer?.email ?? null}
      etransferNotes={etransfer?.notes ?? null}
    />
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PaymentGate />
    </Suspense>
  );
}
