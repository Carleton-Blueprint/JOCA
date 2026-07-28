# Agent notes

Monorepo: `joca-app` (Next.js + Better Auth + Prisma) and `joca-cms` (Strapi 5). Deeper package notes live in each package’s gitignored `CLAUDE.local.md`. Operator/security detail: [HANDOFF.md](HANDOFF.md).

## Auth & data boundaries

- **Login / sessions / subscriptions / votes** → Better Auth + Prisma on Supabase Postgres (`joca-app`).
- **Editorial content (events, elections, candidates) + Member CMS records** → Strapi (`joca-cms`).
- Do **not** use Supabase Auth, Supabase Data API, or Strapi users-permissions for frontend login.
- Votes are Prisma `Vote` rows, not Strapi fields. Strapi GraphQL from the app is **server-only** (`STRAPI_GRAPHQL_URL`, not `NEXT_PUBLIC_`).

## Supabase

JOCA uses Supabase as **hosted Postgres only**. Data API stays disabled; `anon` / `authenticated` grants on `public` stay revoked. Do not flip those back on unless the architecture changes.

Recurring `schema "pg_pgrst_no_exposed_schemas" does not exist` logs are expected with Data API off (harmless). Silence SQL and re-enable caveats: [HANDOFF.md](HANDOFF.md) §3.2 and [docs/0003-choice-of-auth&db.md](docs/0003-choice-of-auth%26db.md).
