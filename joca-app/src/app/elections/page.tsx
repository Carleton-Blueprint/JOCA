import { ElectionCards } from "./ElectionCards";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { NotPaid } from "@/components/NotPaid";
import prisma from "@/lib/prisma";
import { EmailNotVerified } from "@/components/EmailNotVerified";

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <NotLoggedIn />;

  if (!session?.user.emailVerified && process.env.NODE_ENV !== "development")
    return <EmailNotVerified />;

  /*Use a direct prisma query to bypass the 60s cookie cache on session data*/
  // "active" covers the grace period (Stripe keeps status active until periodEnd even after cancellation).
  // If trials are added in future, also include status: "trialing".
  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });

  if (!activeSubscription) return <NotPaid />;

  return <ElectionCards />;
}
