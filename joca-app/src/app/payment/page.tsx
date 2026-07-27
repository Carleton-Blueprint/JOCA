import { StartPaymentPage } from "./StartPaymentPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import prisma from "@/lib/prisma";
import { isEmailUnverified } from "@/lib/email-verification";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function PaymentPage() {
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

  return <StartPaymentPage />;
}
