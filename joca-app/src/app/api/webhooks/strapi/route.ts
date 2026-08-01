import { revalidateTag } from "next/cache";

const REVALIDATION_EVENTS = new Set([
  "entry.publish",
  "entry.unpublish",
  "entry.delete",
  "entry.update",
  "entry.create",
]);

const MODEL_TAGS: Record<string, string> = {
  event: "events",
  election: "elections",
  candidate: "elections",
};

type StrapiWebhookPayload = {
  event?: string;
  model?: string;
};

function isAuthorized(request: Request): boolean {
  const secret = process.env.STRAPI_WEBHOOK_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  return authorization.slice("Bearer ".length) === secret;
}

function tagsForPayload(payload: StrapiWebhookPayload): string[] {
  const event = payload.event ?? "";
  if (!REVALIDATION_EVENTS.has(event)) return [];

  const tag = payload.model ? MODEL_TAGS[payload.model] : undefined;
  return tag ? [tag] : [];
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: StrapiWebhookPayload;
  try {
    payload = (await request.json()) as StrapiWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tags = tagsForPayload(payload);
  if (tags.length === 0) {
    return Response.json({ skipped: true, event: payload.event ?? null });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: tags, event: payload.event ?? null });
}
