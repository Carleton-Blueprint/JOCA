import { ElectionCards } from "./ElectionCards";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { NotPaid } from "@/components/NotPaid";

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <NotLoggedIn />;
  }

  if (!session.user.hasPaid) {
    return <NotPaid />;
  }

  return <ElectionCards />;
}
