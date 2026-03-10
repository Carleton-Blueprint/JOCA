"use server";

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
  documentId: string,
): Promise<{ voteCount: number }> {
  // Fetch the authoritative count from Strapi before incrementing,
  // so we never base the write on a stale Apollo cache value.
  const { candidate } = await strapiRequest<{
    candidate: { voteCount: number };
  }>(`query { candidate(documentId: "${documentId}") { voteCount } }`);

  const nextCount = (candidate?.voteCount ?? 0) + 1;

  const { updateCandidate } = await strapiRequest<{
    updateCandidate: { voteCount: number };
  }>(
    `mutation {
      updateCandidate(documentId: "${documentId}", data: { voteCount: ${nextCount} }) {
        voteCount
      }
    }`,
  );

  return { voteCount: updateCandidate.voteCount };
}
