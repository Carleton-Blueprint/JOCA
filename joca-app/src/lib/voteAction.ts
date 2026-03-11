"use server";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cookies, headers } from "next/headers";

const STRAPI_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  "http://localhost:1337/graphql";

async function strapiRequest<T>(query: string): Promise<T> {
  const res = await fetch(STRAPI_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}

export async function voteForCandidate(
  candidateId: string,
  electionId: string,
): Promise<{ voteCount: number }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id ?? null;

  // Supports both authenticated and anonymous voting.
  // Anonymous voting is limited per-device via a stable, httpOnly cookie.
  const cookieStore = await cookies();
  let anonId: string | null = null;
  if (!userId) {
    const existing = cookieStore.get("joca_anon_voter")?.value;
    anonId = existing ?? crypto.randomUUID();
    if (!existing) {
      cookieStore.set("joca_anon_voter", anonId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  // DB-enforced uniqueness prevents double-votes (and races).
  let createdVote: { id: string } | null = null;
  try {
    createdVote = await prisma.vote.create({
      data: {
        userId,
        anonId,
        electionId,
        candidateId,
      },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("You have already voted in this election.");
    }
    throw error;
  }

  // Fetch the authoritative count from Strapi before incrementing,
  // so we never base the write on a stale Apollo cache value.
  const { candidate } = await strapiRequest<{
    candidate: { voteCount: number };
  }>(`query { candidate(documentId: "${candidateId}") { voteCount } }`);

  const nextCount = (candidate?.voteCount ?? 0) + 1;

  try {
    const { updateCandidate } = await strapiRequest<{
      updateCandidate: { voteCount: number };
    }>(
      `mutation {
        updateCandidate(documentId: "${candidateId}", data: { voteCount: ${nextCount} }) {
          voteCount
        }
      }`,
    );

    return { voteCount: updateCandidate.voteCount };
  } catch (error) {
    // Best-effort rollback: allow user to retry if the Strapi write failed.
    if (createdVote) {
      await prisma.vote.delete({ where: { id: createdVote.id } }).catch(() => {
        // ignore
      });
    }
    throw error;
  }
}
