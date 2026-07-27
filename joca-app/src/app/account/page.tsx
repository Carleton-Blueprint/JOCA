import { redirect } from "next/navigation";
import { AccountPageComponent } from "./AccountPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import { isEmailUnverified } from "@/lib/email-verification";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");
  if (isEmailUnverified(session.user)) return <EmailNotVerified />;

  return <AccountPageComponent />;
}
