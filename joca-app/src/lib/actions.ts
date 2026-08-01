"use server";

import { Prisma } from "../../prisma/generated/prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getElection } from "@/lib/strapi";
import { isWithinVotingWindow } from "@/lib/utils";

export async function voteForCandidate(
  candidateName: string,
  electionId: string,
): Promise<{ voteCount: number }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("You must be logged in to vote.");

  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });
  if (!activeSubscription)
    throw new Error("An active membership is required to vote.");

  const election = await getElection(electionId);
  if (!election) throw new Error("Election not found.");

  if (
    !election.votingDateStart ||
    !election.votingDateEnd ||
    !isWithinVotingWindow(election.votingDateStart, election.votingDateEnd)
  ) {
    throw new Error("Voting is closed for this election.");
  }

  const candidateNames =
    election.candidates?.map((c) => c.name).filter(Boolean) ?? [];
  if (!candidateNames.includes(candidateName)) {
    throw new Error("Selected candidate is not part of this election.");
  }

  const userId = session.user.id;

  // Single atomic DB write. Unique(userId, electionId) prevents double-votes
  // and races — candidateId stores the ballot name string from Strapi.
  try {
    await prisma.vote.create({
      data: {
        userId,
        electionId,
        candidateId: candidateName,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      /* P2002: Unique constraint violation: When you attempt to create/update a record
      that would result in duplicate entries
      In this case, the unique constraint is on the combination of userId and electionId 
      (voting more than once on the same user)
      */
      error.code === "P2002"
    ) {
      throw new Error("You have already voted in this election.");
    }
    throw error;
  }

  const voteCount = await prisma.vote.count({
    where: { electionId, candidateId: candidateName },
  });

  return { voteCount };
}
