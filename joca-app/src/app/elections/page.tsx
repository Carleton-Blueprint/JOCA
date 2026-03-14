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

  /*Use a direct prisma query instead of using the session user object
  because of cookie cache (60 second "delay")*/
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasPaid: true },
  });

  if (!dbUser?.hasPaid) return <NotPaid />;

  return <ElectionCards />;
}
