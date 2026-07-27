import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { EmailVerification } from "./EmailVerificationPage";

interface Props {
  searchParams: Promise<{ name?: string; email?: string }>;
}

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function EmailVerificationPage({ searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.emailVerified) redirect("/payment");

  const { name: nameParam, email: emailParam } = await searchParams;

  // Prefer session (logged-in but unverified), fall back to query params (post-signup, no session yet).
  const name =
    session?.user?.firstName ?? session?.user?.name ?? nameParam ?? "";
  const email = session?.user?.email ?? emailParam ?? "";

  if (!email) redirect("/login");

  return <EmailVerification name={name} email={email} />;
}
