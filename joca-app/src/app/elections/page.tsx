import { Suspense } from "react";
import { ElectionCards } from "./ElectionCards";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { NotPaid } from "@/components/NotPaid";
import prisma from "@/lib/prisma";
import { EmailNotVerified } from "@/components/EmailNotVerified";
import { getElections, getVotedElectionIds } from "@/lib/strapi";
import type { Election } from "@/lib/types";
import Loading from "../loading";

async function ElectionsList({
  userId,
  electionsPromise,
}: {
  userId: string;
  electionsPromise: Promise<Election[]>;
}) {
  const elections = await electionsPromise;
  const votedElectionIds = await getVotedElectionIds(
    elections.map((election) => election.documentId),
    userId,
  );

  return (
    <ElectionCards
      elections={elections}
      votedElectionIds={votedElectionIds}
    />
  );
}

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <NotLoggedIn />;

  if (
    !session?.user.emailVerified &&
    process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== "true"
  )
    return <EmailNotVerified />;

  // Start Strapi fetch early so it overlaps with the subscription check
  const electionsPromise = getElections();

  /* Use a direct prisma query to bypass the 60s cookie cache on session data */
  // If trials are added in future, also include status: "trialing".
  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });

  if (!activeSubscription) return <NotPaid />;

  return (
    <Suspense fallback={<Loading />}>
      <ElectionsList
        userId={session.user.id}
        electionsPromise={electionsPromise}
      />
    </Suspense>
  );
}
