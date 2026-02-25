import { ElectionCards } from "./ElectionCards";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotLoggedIn } from "@/components/NotLoggedIn";

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <NotLoggedIn />;
  }

  return <ElectionCards />;
}
