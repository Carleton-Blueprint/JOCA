import { cacheLife, cacheTag } from "next/cache";
import prisma from "@/lib/prisma";
import type { Election, Event, Member } from "@/lib/types";
import {
  CREATE_MEMBER,
  DELETE_MEMBER,
  GET_ELECTION,
  GET_ELECTIONS,
  GET_EVENTS,
  GET_MEMBER_BY_EMAIL,
  GET_MEMBER_BY_EMAIL_NO_STATUS,
} from "./queries";

const STRAPI_GRAPHQL_URL =
  process.env.NODE_ENV !== "development"
    ? process.env.STRAPI_GRAPHQL_URL!
    : "http://localhost:1337/graphql";

// Generic helper for Strapi GraphQL requests.
// T represents the shape of json.data - NOT the entity itself.
// Strapi wraps every response under a key matching the operation name, e.g.:
//   { "data": { "createMember": { ... } } }
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

async function findMemberByEmail(
  email: string,
  status?: "PUBLISHED" | "DRAFT",
): Promise<Member | null> {
  if (status) {
    const { members } = await strapiRequest<{ members: Member[] }>(
      GET_MEMBER_BY_EMAIL,
      { email, status },
    );
    return members[0] ?? null;
  }

  const { members } = await strapiRequest<{ members: Member[] }>(
    GET_MEMBER_BY_EMAIL_NO_STATUS,
    { email },
  );
  return members[0] ?? null;
}

/**
 * Resolve a member by email.
 * Tries published, then draft (orphan drafts from before D&P was disabled),
 * then a no-status query (Member content type without Draft & Publish).
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  try {
    return (
      (await findMemberByEmail(email, "PUBLISHED")) ??
      (await findMemberByEmail(email, "DRAFT")) ??
      (await findMemberByEmail(email))
    );
  } catch (error) {
    // After D&P is disabled, status-arg queries may fail — fall back.
    try {
      return await findMemberByEmail(email);
    } catch {
      throw new Error("Failed to get member, " + error);
    }
  }
}

export async function deleteMemberByEmail(email: string): Promise<void> {
  const member = await getMemberByEmail(email);
  if (member?.documentId) {
    await strapiRequest(DELETE_MEMBER, { documentId: member.documentId });
  }
}

export async function createMember(
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
): Promise<Member> {
  try {
    const { createMember } = await strapiRequest<{ createMember: Member }>(
      CREATE_MEMBER,
      { data: { firstName, lastName, email, phoneNumber } },
    );
    return createMember;
  } catch (error) {
    throw new Error("Failed to create member, " + error);
  }
}
