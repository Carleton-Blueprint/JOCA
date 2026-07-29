# JOCA — Deploy & Local Setup

Companion to [HANDOFF.md](../HANDOFF.md). Covers local development and production cutover for `joca-app` and `joca-cms`.

---

## Prerequisites

| Tool | Used for |
|------|----------|
| [Bun](https://bun.sh/) | `joca-app` package manager / scripts |
| Node.js 20–24 | `joca-cms` (see `engines` in `joca-cms/package.json`) |
| pnpm or npm | `joca-cms` (repo historically uses pnpm-friendly Strapi tooling) |
| Stripe CLI | Local webhook forwarding (optional but recommended) |
| Access | Supabase, Stripe, Resend, Strapi (local or Cloud) |

---

## Repository layout

```text
JOCA/
├── joca-app/          # Next.js site → Vercel
├── joca-cms/          # Strapi 5 → Strapi Cloud
├── docs/              # ADRs + this guide
└── HANDOFF.md         # Client ownership / ops
```

There is no root monorepo workspace — install and run each app separately.

---

## Local: joca-cms (Strapi)

1. Copy env template:

   ```bash
   cd joca-cms
   cp .env.example .env
   ```

2. Replace all `toBeModified*` secrets (`APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`). Example:

   ```bash
   openssl rand -base64 32
   ```

3. Install and run (SQLite by default):

   ```bash
   pnpm install   # or: npm install
   pnpm run develop
   ```

4. Open `http://localhost:1337/admin`, create the first admin user, and configure **Settings → Users & Permissions → Roles → Public** (and GraphQL) so the Next app can read Events/Elections/Candidates and create/find/delete Members (see [HANDOFF.md](../HANDOFF.md#33-strapi-cloud-cms)).

5. GraphQL playground (when enabled): `http://localhost:1337/graphql`.

### Deploy Strapi to production

Preferred path (ADR 0005): **Strapi Cloud**

```bash
cd joca-cms
pnpm run deploy   # or: npm run deploy
```

Follow Strapi Cloud login/link prompts. Production DB is managed by Strapi Cloud (not the app’s Supabase project).

After deploy:

1. Note the public GraphQL URL → set `STRAPI_GRAPHQL_URL` on Vercel.
2. Create CMS admin accounts for the board.
3. Re-apply Public / API token permissions (Cloud does not inherit local SQLite permission state unless transferred).
4. Restrict CORS to the site origin when the custom domain is ready.
5. Set `STRAPI_WEBHOOK_SECRET` (same value on Strapi Cloud and Vercel) and configure a webhook (see [Strapi cache revalidation](#strapi-cache-revalidation) below).

### Strapi cache revalidation

The Next app caches Event and Election list data (`cacheTag("events")`, `cacheTag("elections")`). Strapi webhooks bust that cache on publish/unpublish/delete.

1. Generate a secret: `openssl rand -base64 32`
2. Set **`STRAPI_WEBHOOK_SECRET`** in both `joca-app/.env` (Vercel in prod) and `joca-cms/.env` (Strapi Cloud in prod). When set, `joca-cms/config/server.ts` attaches `Authorization: Bearer <secret>` to all outbound webhooks.
3. In Strapi Admin → **Settings → Webhooks**:
   - **URL (local):** `http://localhost:3000/api/webhooks/strapi` (Next app must be running)
   - **URL (prod):** `https://<your-domain>/api/webhooks/strapi`
   - **Events:** `entry.publish`, `entry.unpublish`, `entry.delete` for Event, Election, Candidate
4. Test locally:

   ```bash
   curl -X POST http://localhost:3000/api/webhooks/strapi \
     -H "Authorization: Bearer $STRAPI_WEBHOOK_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"event":"entry.publish","model":"event"}'
   ```

   Expect `{"revalidated":["events"],"event":"entry.publish"}`.

Member changes do not invalidate cache (member reads are uncached).

---

## Local: joca-app (Next.js)

1. Copy env template:

   ```bash
   cd joca-app
   cp .env.example .env
   ```

2. Fill required values (see `.env.example`). For a minimal local loop:

   - Point `DATABASE_URL` / `DIRECT_URL` at a Supabase (or local Postgres) database.
   - Set `BETTER_AUTH_SECRET` (random 32+ bytes).
   - Keep `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` as `http://localhost:3000`.
   - Use Stripe **test** keys.
   - Point `STRAPI_GRAPHQL_URL` at `http://localhost:1337/graphql` (or omit reliance on it while `NODE_ENV=development`, which defaults to that URL).

3. Optional local shortcuts:

   - Set `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true` to skip Resend during UI work.
   - Or set `RESEND_API_KEY` and leave verification enabled (still uses `onboarding@resend.dev` until code is updated).

4. Install, generate Prisma client, migrate, run:

   ```bash
   bun install
   bun prisma generate
   bun prisma migrate deploy   # or: bun prisma migrate dev
   bun run dev
   ```

5. App: `http://localhost:3000`.

### Local Stripe webhooks

```bash
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

Copy the CLI webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Ensure Prices in **test mode** use lookup keys:

- `senior-membership`
- `general-membership`
- `family-membership`
- `student-associate-membership`

---

## Production: Vercel (joca-app)

1. Import / link the GitHub repo in Vercel.
2. Set **Root Directory** to `joca-app`.
3. Add all production env vars from `.env.example` (never enable `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION` in prod).
4. Set:

   ```text
   BETTER_AUTH_URL=https://<your-domain>
   NEXT_PUBLIC_BETTER_AUTH_URL=https://<your-domain>
   STRAPI_GRAPHQL_URL=https://<strapi-host>/graphql
   STRAPI_WEBHOOK_SECRET=<same-as-strapi-cloud>
   ```

5. Deploy (`main`). Confirm build runs `prisma generate` via `postinstall`.
6. Run pending migrations against production using `DIRECT_URL` (from a trusted machine):

   ```bash
   cd joca-app
   # With production DIRECT_URL in the environment:
   bun prisma migrate deploy
   ```

7. Attach custom domain in Vercel → update Better Auth URLs → redeploy.

### Production Stripe webhook

Dashboard → Developers → Webhooks → endpoint:

```text
https://<your-domain>/api/auth/stripe/webhook
```

Events: `checkout.session.completed`, `customer.subscription.created|updated|deleted`.  
Paste signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`. Use **live** secret key when cutting over.

---

## Production: Resend

1. Add and verify the JOCA sending domain (DNS records in Resend).
2. Create/rotate API key → `RESEND_API_KEY` on Vercel.
3. Change the `from` address in `joca-app/src/lib/auth.ts` from `onboarding@resend.dev` to an address on the verified domain; redeploy.

---

## Smoke test after deploy

1. Sign up with a real inbox → verification email arrives → link works.
2. Complete checkout for one membership plan → land on success → Member row appears in Strapi.
3. Confirm elections page respects active subscription.
4. Open billing portal from the account UI.
5. Delete test account → Stripe subscription canceled → Strapi Member removed.
6. Publish a draft Event in Strapi → appears on `/events` (immediately if webhook is configured; otherwise within the cache TTL).

---

## Rollback / incidents

| Issue | Action |
|-------|--------|
| Bad frontend deploy | Vercel → previous Deployment → Promote to Production |
| Auth/session outage | Check Supabase status + `DATABASE_URL`; confirm Better Auth URLs match domain |
| `pg_pgrst_no_exposed_schemas` in Postgres logs | Expected while Data API is disabled; not an app outage. Silence or leave alone per [HANDOFF.md](../HANDOFF.md) §3.2 — do not re-enable Data API just to clear logs |
| Payments not activating | Stripe webhook delivery logs; verify secret and events; check `subscription` table |
| CMS empty / GraphQL errors | Strapi Cloud status; permissions; `STRAPI_GRAPHQL_URL` |
| Email not sending | Resend logs; domain verification; `RESEND_API_KEY` |

---

## Quick command cheat sheet

```bash
# CMS
cd joca-cms && pnpm run develop
cd joca-cms && pnpm run deploy

# App
cd joca-app && bun run dev
cd joca-app && bun run build && bun run start
cd joca-app && bun prisma migrate deploy

# Stripe local
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```
