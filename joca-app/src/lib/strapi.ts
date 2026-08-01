import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import type { Election, Event } from "@/lib/types";
import { GET_ELECTION, GET_ELECTIONS, GET_EVENTS } from "./queries";

const STRAPI_GRAPHQL_URL =
  process.env.NODE_ENV !== "development"
    ? process.env.STRAPI_GRAPHQL_URL!
    : "http://localhost:1337/graphql";

// Generic helper for Strapi GraphQL requests.
// T represents the shape of json.data - NOT the entity itself.
// Strapi wraps every response under a key matching the operation name, e.g.:
//   { "data": { "events": [ ... ] } }
export async function strapiRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  { cached = false }: { cached?: boolean } = {},
): Promise<T> {
  const res = await fetch(STRAPI_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // Cached callers use `"use cache"`; skip no-store so the fetch can participate.
    ...(cached ? {} : { cache: "no-store" as const }),
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

export async function getEvents(): Promise<Event[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("events");
  const { events } = await strapiRequest<{ events: Event[] }>(
    GET_EVENTS,
    undefined,
    { cached: true },
  );
  return events ?? [];
}

export async function getElections(): Promise<Election[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("elections");
  const { elections } = await strapiRequest<{ elections: Election[] }>(
    GET_ELECTIONS,
    undefined,
    { cached: true },
  );
  return elections ?? [];
}

export async function getElection(
  documentId: string,
): Promise<Election | null> {
  try {
    const { election } = await strapiRequest<{ election: Election | null }>(
      GET_ELECTION,
      { documentId },
    );
    return election ?? null;
  } catch (error) {
    throw new Error("Failed to get election, " + error);
  }
}

export async function getVotedElectionIds(
  electionIds: string[],
  userId: string,
): Promise<string[]> {
  if (electionIds.length === 0) return [];

  const votes = await prisma.vote.findMany({
    where: {
      userId,
      electionId: { in: electionIds },
    },
    select: { electionId: true },
  });

  return votes.map((vote) => vote.electionId);
}
