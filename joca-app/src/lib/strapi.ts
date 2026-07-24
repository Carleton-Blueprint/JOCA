import prisma from "@/lib/prisma";
import type { Election, Event, Member } from "@/lib/types";
import {
  CREATE_MEMBER,
  DELETE_MEMBER,
  GET_ELECTIONS,
  GET_EVENTS,
  GET_MEMBER_BY_EMAIL,
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
): Promise<T> {
  const res = await fetch(STRAPI_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
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

export async function getEvents(): Promise<Event[]> {
  try {
    const { events } = await strapiRequest<{ events: Event[] }>(GET_EVENTS);
    return events ?? [];
  } catch (error) {
    throw new Error("Failed to get events, " + error);
  }
}

export async function getElections(): Promise<Election[]> {
  try {
    const { elections } = await strapiRequest<{ elections: Election[] }>(
      GET_ELECTIONS,
    );
    return elections ?? [];
  } catch (error) {
    throw new Error("Failed to get elections, " + error);
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

export async function getMemberByEmail(email: string): Promise<Member | null> {
  try {
    const { members } = await strapiRequest<{ members: Member[] }>(
      GET_MEMBER_BY_EMAIL,
      { email },
    );
    return members[0] ?? null;
  } catch (error) {
    throw new Error("Failed to get member, " + error);
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
