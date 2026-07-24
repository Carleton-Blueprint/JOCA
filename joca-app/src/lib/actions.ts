"use server";

import { Prisma } from "../../prisma/generated/prisma/client";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function voteForCandidate(
  candidateId: string,
  electionId: string,
): Promise<{ voteCount: number }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("You must be logged in to vote.");

  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id, status: "active" },
  });
  if (!activeSubscription)
    throw new Error("An active membership is required to vote.");

  const userId = session.user.id;

  // Single atomic DB write. Unique(userId, electionId) prevents double-votes
  // and races — no denormalized Strapi voteCount to drift under concurrency.
  try {
    await prisma.vote.create({
      data: {
        userId,
        electionId,
        candidateId,
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
    where: { candidateId },
  });

  return { voteCount };
}
