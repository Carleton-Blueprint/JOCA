# JOCA — Client Handoff Guide

Operational guide for running and owning the JOCA web stack after Blueprint handoff.

For step-by-step deploy and local setup, see [docs/DEPLOY.md](docs/DEPLOY.md).  
Env templates: [joca-app/.env.example](joca-app/.env.example) · [joca-cms/.env.example](joca-cms/.env.example).

---

## 1. What you are receiving

| Piece               | Path / product                     | Role                                       |
| ------------------- | ---------------------------------- | ------------------------------------------ |
| Website (Next.js)   | `joca-app/` → **Vercel**           | Public site, auth, payments, voting UI     |
| CMS (Strapi 5)      | `joca-cms/` → **Strapi Cloud**     | Events, elections, candidates, members     |
| Auth / app database | **Supabase** Postgres (via Prisma) | Users, sessions, subscriptions, votes      |
| Payments            | **Stripe**                         | Membership subscriptions + Customer Portal |
| Email               | **Resend**                         | Email verification messages                |

Architecture note: login accounts live in Supabase/Prisma (Better Auth). **Member** records in Strapi are created after successful payment and used for elections/candidates. Do not treat Strapi Users & Permissions as the primary member login system.

---

## 2. Account ownership transfer (do this first)

Invite client org admins (or transfer ownership) on every service before Blueprint access ends:

| Service      | What to transfer / invite       | Notes                                       |
| ------------ | ------------------------------- | ------------------------------------------- |
| GitHub       | Repo access (org preferred)     | Source of truth; Vercel deploys from `main` |
| Vercel       | Project `joca` (team transfer)  | Env vars, domains, production deploys       |
| Supabase     | Project `JOCA` (`ca-central-1`) | Database + connection strings               |
| Strapi Cloud | CMS project + admin users       | Content + CMS database                      |
| Stripe       | Account access / ownership      | Test and live modes                         |
| Resend       | Account + verified domain       | Sending API key                             |

Also rotate any shared student credentials after transfer.

---

## 3. Service runbooks

### 3.1 Vercel (frontend)

- **App directory:** `joca-app` (Root Directory in Vercel project settings).
- **Framework:** Next.js; deploys on push to `main` (and preview branches).
- **Required env vars:** copy from [joca-app/.env.example](joca-app/.env.example). In production you **must** set:
  - `DATABASE_URL`, `DIRECT_URL`
  - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `RESEND_API_KEY`
  - `STRAPI_GRAPHQL_URL`
- **Do not set** `NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION=true` in production.
- After attaching a custom domain, update `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` to that origin (no trailing slash), then redeploy.

### 3.2 Supabase (app database)

- Used **only** as Postgres for Prisma/Better Auth (no Supabase Auth client in the app; do not use the Supabase JS Data API).
- Provide operators with:
  - Project URL / region
  - **Pooled** connection string → `DATABASE_URL`
  - **Direct** connection string → `DIRECT_URL` (migrations)
- **Security posture (intentional):**
  1. **Data API disabled** — PostgREST/`/rest/v1` is not an app access path.
  2. **Grants for `anon` / `authenticated` on `public` revoked** — no schema `USAGE` and no table/sequence/routine privileges on app tables.
  3. **RLS enabled** on `user`, `session`, `account`, `verification`, `vote`, `subscription`, and `_prisma_migrations`, with **no policies** (deny by default for API roles).
  4. Keep all app DB access **server-side via Prisma** using the database password. Never use the Supabase anon key from the browser against these tables.
- **Known log noise:** With the Data API off, Postgres may repeatedly log `schema "pg_pgrst_no_exposed_schemas" does not exist`. Harmless. To silence it (keep Data API disabled):

  ```sql
  CREATE SCHEMA IF NOT EXISTS pgrst_no_exposed_schemas;
  ALTER ROLE authenticator SET pgrst.db_schemas = 'pgrst_no_exposed_schemas';
  NOTIFY pgrst;
  ```

  If you later re-enable the Data API, reset that role setting first (e.g. `ALTER ROLE authenticator RESET pgrst.db_schemas; NOTIFY pgrst;`) and expose `public` again in project settings. See [Supabase troubleshooting](https://supabase.com/docs/guides/troubleshooting/schema-pg_pgrst_no_exposed_schemas-does-not-exist).

Schema changes: run Prisma migrations from `joca-app` (see [DEPLOY.md](docs/DEPLOY.md)).

### 3.3 Strapi Cloud (CMS)

**Content types**

| Type          | Draft & publish? | Who manages it     | Purpose                                                              |
| ------------- | ---------------- | ------------------ | -------------------------------------------------------------------- |
| **Event**     | Yes              | Board / CMS admins | Public events page                                                   |
| **Election**  | Yes              | Board / CMS admins | Voting windows + metadata                                            |
| **Candidate** | Yes              | Board / CMS admins | Links a **Member** to an **Election**                                |
| **Member**    | No               | App (auto)         | Created after successful Stripe payment; deleted on account deletion |

**Typical CMS workflows**

1. **Publish an event:** Content Manager → Events → fill title, date, time, location, category (`Culture` `Community` `Education`), description → Publish.
2. **Run an election:** Create Election (title, category `Executive` `Committee` `Referendum`, voting start/end) → ensure paid members exist → create Candidate entries linking Member + Election → Publish election and candidates.
3. **Do not manually invent Members** for paid users unless recovering from a sync failure; the site creates them on `/payment/success`.

**Permissions (important)**

Today the Next.js server calls Strapi GraphQL **without** an API token (`joca-app/src/lib/strapi.ts`). That means Public (or equivalent) GraphQL permissions must allow at least:

- **Event / Election / Candidate:** find / findOne (read published content)
- **Member:** find, create, delete (used after payment and on account delete)

**Hardening recommendation before public launch:** create a Strapi API token with only those permissions, send it as `Authorization: Bearer …` from the Next.js server, and remove create/delete from the Public role. Document the token in Vercel (e.g. future `STRAPI_API_TOKEN`) once the code is updated.

**CORS:** default `strapi::cors`. After the custom domain is live, restrict allowed origins to the production (and preview) site URLs in Strapi Cloud / middleware config.

### 3.4 Stripe (memberships)

Better Auth Stripe plugin endpoint:

```text
https://<YOUR_DOMAIN>/api/auth/stripe/webhook
```

**Plans / lookup keys** (must match Stripe Price lookup keys exactly):

| Plan name in code   | Lookup key                     |
| ------------------- | ------------------------------ |
| Senior              | `senior-membership`            |
| General             | `general-membership`           |
| Family              | `family-membership`            |
| Student / associate | `student-associate-membership` |

**Webhook events to subscribe:**

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Operator checklist**

1. Create Products + Prices in **test** and **live** with the lookup keys above.
2. Configure Customer Portal (cancel / update payment method) in both modes.
3. Add webhook endpoint pointing at the URL above; copy signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Set `STRIPE_SECRET_KEY` on Vercel (`sk_test_…` vs `sk_live_…`).
5. Local forwarding: `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`.

Billing portal and checkout are already wired in the app UI. No Stripe Connect.

### 3.5 Resend (email)

- Used for **email verification** only (no password-reset flow in the product yet).
- Production still needs a verified JOCA domain and a real `from` address.
- Code currently sends from `onboarding@resend.dev` (`joca-app/src/lib/auth.ts`) — replace after DNS verification in Resend.
- Set `RESEND_API_KEY` on Vercel; keep it unset only for local work that also skips verification.

---
