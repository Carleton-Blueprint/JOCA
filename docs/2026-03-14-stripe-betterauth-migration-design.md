# Stripe + BetterAuth Plugin Migration Design

**Date:** 2026-03-14
**Status:** Approved

## Overview

Migrate from a manual Stripe integration (custom webhook handler, `hasPaid` boolean, `createCheckoutSession` server action) to the `@better-auth/stripe` plugin's native subscription management. The plugin is already partially wired in; this migration completes the integration and removes all manual plumbing.

## Goals

- Remove manual webhook handler and checkout server action
- Replace `hasPaid` boolean with a proper `subscription` table
- Gate `/elections` access by active subscription status
- Preserve grace period: access continues until end of billing period after cancellation
- Single source of truth for payment status

## Out of Scope

- Multiple membership tiers (one plan: "membership")
- Organization billing
- Trial periods
- ~~Billing portal UI~~ (added post-migration - see Post-Migration Additions)

---

## Section 1: Database & Schema

**Changes to `prisma/schema.prisma`:**
- Remove `hasPaid Boolean @default(false)` from the `User` model
- Add a `Subscription` model with fields required by the BetterAuth Stripe plugin:

```prisma
model Subscription {
  id                   String    @id
  plan                 String
  referenceId          String
  stripeCustomerId     String?
  stripeSubscriptionId String?
  status               String
  periodStart          DateTime?
  periodEnd            DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  cancelAt             DateTime?
  canceledAt           DateTime?
  endedAt              DateTime?
  trialStart           DateTime?
  trialEnd             DateTime?
  billingInterval      String?
  seats                Int?
  stripeScheduleId     String?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@map("subscription")
}
```

- `stripeCustomerId` on `User` remains (already present)

**Migration command:**
```bash
pnpm prisma migrate dev --name add-subscription-remove-haspaid
```

---

## Section 2: Auth Server Config (`src/lib/auth.ts`)

Two changes required:

**1. Remove `hasPaid` from `additionalFields`** - this block must be deleted in full:
```typescript
// DELETE THIS:
additionalFields: {
  hasPaid: {
    type: "boolean",
    defaultValue: false,
    required: false,
  },
},
```

**2. Add `subscription` config block to the existing `stripe()` plugin call:**

```typescript
stripe({
  stripeClient,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  subscription: {
    enabled: true,
    plans: [
      {
        name: "membership",
        lookupKey: "membership",
      },
    ],
  },
})
```

`lookupKey` is used instead of `priceId` so admins can update the membership price in the Stripe Dashboard without a code change or redeploy - just reassign the `"membership"` lookup key to the new price. `createCustomerOnSignUp` is intentionally omitted: enabling it causes duplicate Stripe customers (one on signup, one at checkout). The Stripe customer is created lazily at checkout and linked to the user via the authenticated session.

The plugin handles webhook routing, signature verification, and subscription lifecycle internally. No other changes needed.

---

## Section 3: Auth Client (`src/lib/auth-client.ts`)

Export `subscription` from the destructured auth client so `StartPaymentPage` can call `subscription.upgrade()`. Better Auth's client returns `subscription` as a namespace object (with methods like `upgrade`, `list`, `cancel`, etc.) directly on the client instance, so it can be destructured alongside the other named exports:

```typescript
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  updateUser,
  changePassword,
  deleteUser,
  subscription,   // ADD THIS
} = createAuthClient({ ... })
```

---

## Section 4: Auth Types (`src/lib/auth.types.ts`)

Remove `hasPaid` from `CustomUser` - it will no longer exist on the user object:

```typescript
export interface CustomUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // hasPaid removed
}
```

---

## Section 5: Checkout Flow

**Delete:** `src/lib/checkout.ts`

**Update `src/app/payment/StartPaymentPage.tsx`:** Replace the `createCheckoutSession` server action call with the plugin's client `subscription.upgrade()`:

```typescript
import { subscription } from "@/lib/auth-client";

const handlePayment = async () => {
  setIsLoading(true);
  try {
    await subscription.upgrade({
      plan: "membership",
      successUrl: "/payment/success",
      cancelUrl: "/payment/cancel",
    });
  } catch (error) {
    setIsLoading(false);
    toast.error("Failed to initiate payment. Please try again.");
  }
};
```

`subscription.upgrade()` handles the redirect to Stripe internally, so no manual `window.location.href` assignment is needed. Remove the `session.user.email` check (no longer required - customer is resolved via `stripeCustomerId` set at signup).

---

## Section 6: Webhook Handler

**Delete:** `src/app/api/webhooks/stripe/route.ts`

BetterAuth automatically exposes the webhook at `/api/auth/stripe/webhook`. No code needed.

**Update Stripe Dashboard webhook URL:**
- Old: `https://<domain>/api/webhooks/stripe`
- New: `https://<domain>/api/auth/stripe/webhook`

**Update local dev forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

**Required Stripe events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Note: `invoice.paid` from the old handler is not needed. The plugin updates the subscription record (including `periodStart`/`periodEnd`) via `customer.subscription.updated`, which Stripe fires on every renewal.

---

## Section 7: `checkIfHasPaid` in `src/lib/actions.ts`

**Delete** the `checkIfHasPaid` function (lines 109-120). It queries `hasPaid` which will no longer exist. Each call site replaces it with an inline subscription query (see Section 8).

---

## Section 8: Access Gating & Payment Pages

All pages that called `checkIfHasPaid` switch to an inline subscription query. The helper function to use:

```typescript
const subscription = await prisma.subscription.findFirst({
  where: { referenceId: session.user.id, status: "active" },
});
const hasActiveSubscription = !!subscription;
```

`status === "active"` covers the grace period: Stripe keeps subscriptions `active` until `periodEnd`, even when `cancelAtPeriodEnd: true`.

**`src/app/elections/page.tsx`:**
Replace `hasPaid` Prisma query with subscription check. Return `<NotPaid />` if no active subscription.

**`src/app/payment/page.tsx`:**
Replace `checkIfHasPaid` call with subscription check. Redirect to `/payment/success` if active subscription found.

**`src/app/payment/cancel/page.tsx`:**
Replace `checkIfHasPaid` call with subscription check. The correct post-migration condition: `if (hasActiveSubscription) redirect("/payment/success")` - redirect away from the cancel page if the user already has an active subscription. (Note: the current code has this condition backwards - `if (!hasPaid) redirect("/payment/success")` - which is a pre-existing bug; the migration should fix it to the correct logic.)

**`src/app/payment/success/page.tsx`:**
- Remove the `checkIfHasPaid` import and manual Stripe session retrieval (`stripe.checkout.sessions.retrieve`)
- Remove the `searchParams` prop and `session_id` handling entirely (the plugin's `successUrl` does not append `session_id`)
- Replace verification logic with the subscription check above
- If no active subscription found, show "Payment Pending" (webhook may not have fired yet)

---

## Files Changed Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Remove `hasPaid`, add `Subscription` model |
| `src/lib/auth.ts` | Remove `additionalFields.hasPaid`; add `subscription` config to stripe plugin |
| `src/lib/auth-client.ts` | Export `subscription` from destructured client |
| `src/lib/auth.types.ts` | Remove `hasPaid` from `CustomUser` |
| `src/lib/checkout.ts` | Delete |
| `src/lib/actions.ts` | Delete `checkIfHasPaid` function |
| `src/app/api/webhooks/stripe/route.ts` | Delete |
| `src/app/payment/StartPaymentPage.tsx` | Replace server action with `subscription.upgrade()` |
| `src/app/payment/page.tsx` | Replace `checkIfHasPaid` with subscription query |
| `src/app/payment/cancel/page.tsx` | Replace `checkIfHasPaid` with subscription query |
| `src/app/payment/success/page.tsx` | Replace manual verification + `session_id` handling with subscription query |
| `src/app/elections/page.tsx` | Replace `hasPaid` query with subscription query |
| `joca-app/CLAUDE.local.md` | Update Payment Flow section to reflect new plugin-based flow |

---

## Post-Migration Additions

The following were discovered and added after the initial migration:

**Account deletion billing fix:** Added `beforeDelete` hook to `auth.ts` `deleteUser` config. Cancels the user's active Stripe subscription and deletes their subscription record before the user row is removed - prevents continued billing after account deletion. The `delete()` call is guarded by `if (sub)` so users who never paid can still delete their account without a P2025 error. Direct DB deletions bypass this hook; cancel the Stripe subscription manually in the Stripe Dashboard in that case.

**Subscription uniqueness:** Added `@@unique([referenceId])` to the `Subscription` model. Enforces one subscription per user at the DB level. Also replaced `findFirst`/`deleteMany` in the `beforeDelete` hook with `findUnique`/`delete`. The unique constraint is applied in migration `20260314220000` via `CREATE UNIQUE INDEX IF NOT EXISTS`.

**Migration order fix:** Migration `20260314215529_add_subscription_referenceid_index` was out of order - it referenced the `subscription` table before it was created by `20260314220000`. The index migration was made a no-op; the unique index creation was moved into `20260314220000` using `CREATE UNIQUE INDEX IF NOT EXISTS` (safe for existing DBs where the constraint was already applied via `db push`).

**STRIPE_WEBHOOK_SECRET dev guard:** The startup guard for `STRIPE_WEBHOOK_SECRET` is now dev-aware - `isDev` is declared before the guard and the check is wrapped with `!isDev`, matching the same pattern used for `RESEND_API_KEY`. Developers running locally without the webhook secret no longer get a startup crash.

**Billing portal:** Added `subscription.billingPortal()` call in `Header.tsx` under the user dropdown ("Manage membership" item). Uses `onSelect` directly on `DropdownMenuItem` (no `<Link>` wrapper needed - the plugin handles the redirect internally). Wrapped in try/catch - unpaid users (no Stripe customer) see a toast error rather than a silent failure. No code changes required when switching to live mode; configure the portal separately in the live mode Stripe Dashboard.

---

## Environment Variables

`STRIPE_PRICE_ID` is no longer needed - replaced by Stripe lookup keys. Remove it from `.env`.
