import { StartPaymentPage } from "./StartPaymentPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailNotVerified } from "@/components/EmailNotVerified";

export default async function PaymentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  if (session?.user.emailVerified && process.env.NODE_ENV !== "development")
    return <EmailNotVerified />;

  if (session?.user.hasPaid) redirect("/payment/success");

  return <StartPaymentPage />;
}
