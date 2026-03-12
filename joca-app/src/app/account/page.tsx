import { redirect } from "next/navigation";
import { AccountPageComponent } from "./AccountPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  return <AccountPageComponent />;
}
