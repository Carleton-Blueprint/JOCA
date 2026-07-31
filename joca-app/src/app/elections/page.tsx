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
import { isEmailUnverified } from "@/lib/email-verification";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";

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

async function ElectionsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return <NotLoggedIn />;

  if (isEmailUnverified(session.user)) return <EmailNotVerified />;

  // Start Strapi fetch early so it overlaps with the subscription check
  const electionsPromise = getElections();

  /* Use a direct prisma query to bypass the 60s cookie cache on session data */
  // If trials are added in future, also include status: "trialing".
  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });

  if (!activeSubscription) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { membershipStatus: true },
    });
    if (user?.membershipStatus === MEMBERSHIP_STATUS.APPROVED) {
      return (
        <NotPaid
          href="/payment"
          title="Payment required"
          description="Your membership was approved. Complete payment to access elections."
          cta="Complete payment"
        />
      );
    }
    return <NotPaid />;
  }

  return (
    <ElectionsList
      userId={session.user.id}
      electionsPromise={electionsPromise}
    />
  );
}

export default function ElectionsPage() {
  return (
    <main className="w-full h-full flex flex-col gap-6 p-8">
      <section className="flex flex-col gap-3 items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">Elections</h1>
        <p className="text-gray-500 max-w-2xl">
          Explore upcoming JOCA elections and referenda. Search by name,
          location, or browse by category.
        </p>
      </section>
      <Suspense fallback={<Loading />}>
        <ElectionsContent />
      </Suspense>
    </main>
  );
}
