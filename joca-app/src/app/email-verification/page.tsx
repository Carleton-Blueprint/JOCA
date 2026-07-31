import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailVerification } from "./EmailVerificationPage";
import Loading from "../loading";

interface Props {
  searchParams: Promise<{ name?: string; email?: string }>;
}

async function EmailVerificationContent({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; email?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.emailVerified) redirect("/pending");

  const { name: nameParam, email: emailParam } = await searchParams;

  // Prefer session (logged-in but unverified), fall back to query params (post-signup, no session yet).
  const name =
    session?.user?.firstName ?? session?.user?.name ?? nameParam ?? "";
  const email = session?.user?.email ?? emailParam ?? "";

  if (!email) redirect("/login");

  return <EmailVerification name={name} email={email} />;
}

export default function EmailVerificationPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <EmailVerificationContent searchParams={searchParams} />
    </Suspense>
  );
}
