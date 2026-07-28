import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountPageComponent } from "./AccountPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import { isEmailUnverified } from "@/lib/email-verification";
import Loading from "../loading";

async function AccountGate() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");
  if (isEmailUnverified(session.user)) return <EmailNotVerified />;

  return <AccountPageComponent />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountGate />
    </Suspense>
  );
}
