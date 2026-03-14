# Stripe + BetterAuth Plugin Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the migration from manual Stripe plumbing (`hasPaid` boolean, custom webhook, server action) to the `@better-auth/stripe` plugin's native subscription management.

**Architecture:** The BetterAuth Stripe plugin is already partially wired in (`auth.ts`, `auth-client.ts`). This migration adds the `subscription` DB table, removes the manual webhook handler and checkout server action, and updates all access-gating logic to query subscription status instead of the `hasPaid` boolean.

**Tech Stack:** Next.js 16 (App Router), Better Auth, `@better-auth/stripe`, Prisma ORM, Supabase PostgreSQL, Stripe

---

## Chunk 1: Foundation - Schema, Auth Config, Types

### Task 1: Update Prisma Schema

**Files:**

- Modify: `joca-app/prisma/schema.prisma`

- [ ] **Step 1: Remove `hasPaid` from the User model**

  In `joca-app/prisma/schema.prisma`, delete this line from the `User` model:

  ```prisma
  hasPaid       Boolean   @default(false)
  ```

- [ ] **Step 2: Add the Subscription model**

  Append this model at the end of `joca-app/prisma/schema.prisma` (before the final newline):

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

- [ ] **Step 3: Verify `prisma.config.ts` before migrating**

  This project's Prisma setup does NOT use `url`/`directUrl` in `schema.prisma`. All connection config lives in `joca-app/prisma.config.ts`, which uses `DIRECT_URL` (port 5432 direct connection) for migrations. Supabase's transaction pooler (port 6543) cannot run DDL - migrations will hang or fail if `DIRECT_URL` is not set.

  Confirm `DIRECT_URL` is present in `.env` before continuing:

  ```bash
  cd joca-app && grep DIRECT_URL .env
  ```

  Expected: `DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"`

- [ ] **Step 4: Run the migration**

  ```bash
  cd joca-app && pnpm prisma migrate dev --name add-subscription-remove-haspaid
  ```

  Expected: Migration applied successfully, new `subscription` table created in Supabase, `hasPaid` column dropped from `user` table.

- [ ] **Step 5: Regenerate Prisma client**

  ```bash
  cd joca-app && pnpm prisma generate
  ```

  Expected: `src/generated/prisma/` updated with `Subscription` model, `hasPaid` removed from `User` type.

---

### Task 2: Update Auth Server Config

**Files:**

- Modify: `joca-app/src/lib/auth.ts`

- [ ] **Step 0: Verify `@better-auth/stripe` version**

  The subscription feature requires `@better-auth/stripe` v1.5.0+. Confirm the installed version:

  ```bash
  cd joca-app && pnpm list @better-auth/stripe
  ```

  Expected: `@better-auth/stripe 1.5.5` (or higher). If lower than 1.5.0, run `pnpm add @better-auth/stripe@latest` before proceeding.

- [ ] **Step 1: Remove the `hasPaid` additionalFields block**

  In `src/lib/auth.ts`, delete the entire `additionalFields` block inside the `user` config:

  ```typescript
  // DELETE this entire block:
  additionalFields: {
    hasPaid: {
      type: "boolean",
      defaultValue: false,
      required: false,
    },
  },
  ```

  The `user` config should only contain `deleteUser: { enabled: true }` after this change.

- [ ] **Step 2: Add subscription config to the stripe plugin**

  Find the `stripe({...})` call in `plugins` array and add the `subscription` block:

  ```typescript
  stripe({
    stripeClient,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    createCustomerOnSignUp: true,
    subscription: {
      enabled: true,
      plans: [
        {
          name: "membership",
          priceId: process.env.STRIPE_PRICE_ID!,
        },
      ],
    },
  }),
  ```

- [ ] **Step 3: Type-check**

  ```bash
  cd joca-app && pnpm tsc --noEmit 2>&1 | head -30
  ```

  Expected: Errors only about `hasPaid` references in other files (not yet fixed) - no errors in `auth.ts` itself.

---

### Task 3: Update Auth Types and Auth Client

**Files:**

- Modify: `joca-app/src/lib/auth.types.ts`
- Modify: `joca-app/src/lib/auth-client.ts`

- [ ] **Step 1: Remove `hasPaid` from CustomUser**

  In `src/lib/auth.types.ts`, remove the `hasPaid` line:

  ```typescript
  // DELETE this line:
  hasPaid: boolean; // Add your custom field here
  ```

- [ ] **Step 2: Export `subscription` from auth-client**

  In `src/lib/auth-client.ts`, add `subscription` to the destructured exports:

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
    subscription, // ADD THIS
  } = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    plugins: [
      stripeClient({
        subscription: true,
      }),
    ],
  });
  ```

- [ ] **Step 3: Commit foundation changes**

  ```bash
  cd joca-app && git add prisma/schema.prisma src/lib/auth.ts src/lib/auth-client.ts src/lib/auth.types.ts && git commit -m "feat: add subscription schema and update BetterAuth stripe plugin config"
  ```

---

## Chunk 2: Remove Manual Plumbing

### Task 4: Delete Webhook Handler and Checkout Server Action

**Files:**

- Delete: `joca-app/src/app/api/webhooks/stripe/route.ts`
- Delete: `joca-app/src/lib/checkout.ts`

- [ ] **Step 1: Delete the manual webhook handler**

  Delete the file `src/app/api/webhooks/stripe/route.ts`.

  The BetterAuth plugin automatically exposes its webhook at `/api/auth/stripe/webhook` via the existing `[...all]` catch-all route - no replacement file needed.

- [ ] **Step 2: Delete the checkout server action**

  Delete the file `src/lib/checkout.ts`.

- [ ] **Step 3: Commit deletions**

  ```bash
  cd joca-app && git add -A && git commit -m "feat: remove manual webhook handler and checkout server action"
  ```

---

### Task 5: Remove `checkIfHasPaid` from actions.ts

**Files:**

- Modify: `joca-app/src/lib/actions.ts`

- [ ] **Step 1: Delete the `checkIfHasPaid` function**

  In `src/lib/actions.ts`, delete lines 109-120 (the entire `checkIfHasPaid` export):

  ```typescript
  // DELETE this entire function:
  export async function checkIfHasPaid(userId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { hasPaid: true },
      });
      return user?.hasPaid ?? false;
    } catch (error) {
      throw error;
    }
  }
  ```

- [ ] **Step 2: Commit**

  ```bash
  cd joca-app && git add src/lib/actions.ts && git commit -m "feat: remove checkIfHasPaid - replaced by subscription table query"
  ```

---

## Chunk 3: Update Payment Pages and Access Gating

### Task 6: Update StartPaymentPage

**Files:**

- Modify: `joca-app/src/app/payment/StartPaymentPage.tsx`

- [ ] **Step 1: Rewrite StartPaymentPage.tsx**

  Replace the entire file contents with the following. Key changes: import `subscription` instead of `createCheckoutSession`; call `subscription.upgrade()` which handles redirect internally; remove email guard and `useRouter` (no longer needed).

  ```typescript
  "use client";

  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { useSession, subscription } from "@/lib/auth-client";
  import { useEffect, useState } from "react";
  import { toast } from "sonner";
  import Loading from "../loading";
  import { NotLoggedIn } from "@/components/NotLoggedIn";

  export const StartPaymentPage = () => {
    const { data: session, isPending } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

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

    if (!isMounted || isPending) return <Loading />;

    if (!session?.user) return <NotLoggedIn />;

    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>JOCA Membership Payment</CardTitle>
            <CardDescription>
              Complete your membership by making a payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You will be redirected to Stripe Checkout to securely complete
                your payment.
              </p>
              <p className="text-sm text-muted-foreground">
                Payment methods accepted: Credit/Debit cards, Apple Pay, Google
                Pay
              </p>
            </div>
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Processing..." : "Make Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };
  ```

- [ ] **Step 2: Type-check**

  ```bash
  cd joca-app && pnpm tsc --noEmit 2>&1 | grep "StartPaymentPage"
  ```

  Expected: No errors for this file.

---

### Task 7: Update payment/page.tsx

**Files:**

- Modify: `joca-app/src/app/payment/page.tsx`

- [ ] **Step 1: Replace checkIfHasPaid with subscription query**

  Rewrite `src/app/payment/page.tsx`:

  ```typescript
  import { StartPaymentPage } from "./StartPaymentPage";
  import { auth } from "@/lib/auth";
  import { headers } from "next/headers";
  import { redirect } from "next/navigation";
  import { EmailNotVerified } from "@/components/EmailNotVerified";
  import prisma from "@/lib/prisma";

  export default async function PaymentPage() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) redirect("/login");

    if (!session?.user.emailVerified && process.env.NODE_ENV !== "development")
      return <EmailNotVerified />;

    const activeSubscription = await prisma.subscription.findFirst({
      where: { referenceId: session.user.id, status: "active" },
    });
    if (activeSubscription) redirect("/payment/success");

    return <StartPaymentPage />;
  }
  ```

---

### Task 8: Update payment/cancel/page.tsx

**Files:**

- Modify: `joca-app/src/app/payment/cancel/page.tsx`

- [ ] **Step 1: Replace checkIfHasPaid with subscription query**

  Note: The current code has a bug (`if (!hasPaid) redirect(...)` is backwards). This migration fixes it to the correct condition.

  Rewrite `src/app/payment/cancel/page.tsx`:

  ```typescript
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { auth } from "@/lib/auth";
  import { headers } from "next/headers";
  import { redirect } from "next/navigation";
  import prisma from "@/lib/prisma";

  export default async function PaymentCancelPage() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) redirect("/login");

    const activeSubscription = await prisma.subscription.findFirst({
      where: { referenceId: session.user.id, status: "active" },
    });
    if (activeSubscription) redirect("/payment/success");

    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Payment Cancelled</CardTitle>
            <CardDescription>Your payment was not completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No charges were made. You can try again whenever you're ready.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/payment">Try Again</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  ```

---

### Task 9: Update payment/success/page.tsx

**Files:**

- Modify: `joca-app/src/app/payment/success/page.tsx`

- [ ] **Step 1: Rewrite success page**

  Remove: manual Stripe session retrieval, `session_id` search param, `checkIfHasPaid` import, `stripe` import.
  Replace verification with a direct subscription query.

  Rewrite `src/app/payment/success/page.tsx`:

  ```typescript
  import { auth } from "@/lib/auth";
  import prisma from "@/lib/prisma";
  import { headers } from "next/headers";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  import { NotLoggedIn } from "@/components/NotLoggedIn";

  export default async function PaymentSuccessPage() {
    const authSession = await auth.api.getSession({ headers: await headers() });
    if (!authSession?.user) return <NotLoggedIn />;

    const activeSubscription = await prisma.subscription.findFirst({
      where: { referenceId: authSession.user.id, status: "active" },
    });
    const paymentVerified = !!activeSubscription;

    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle
              className={paymentVerified ? "text-green-600" : "text-amber-600"}
            >
              {paymentVerified ? "Payment Successful!" : "Payment Pending"}
            </CardTitle>
            <CardDescription>
              {paymentVerified
                ? "Thank you for your membership payment"
                : "Your payment has yet to be confirmed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentVerified ? (
              <>
                <p className="text-sm text-green-600 font-medium">
                  Payment verified! Your membership is now active.
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/">Go to Home</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/elections">View Elections</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Your payment could not be confirmed yet. If you paid, your
                  membership status will be updated shortly. If this persists,
                  please contact support.
                </p>
                <p className="text-xs text-muted-foreground">
                  If you did not pay, please go here to try again:
                  <Button asChild variant="outline" className="ml-2">
                    <Link href="/payment">Try Again</Link>
                  </Button>
                </p>
                <Button asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  ```

---

### Task 10: Update elections/page.tsx

**Files:**

- Modify: `joca-app/src/app/elections/page.tsx`

- [ ] **Step 1: Replace hasPaid query with subscription query**

  Rewrite `src/app/elections/page.tsx`:

  ```typescript
  import { ElectionCards } from "./ElectionCards";
  import { auth } from "@/lib/auth";
  import { headers } from "next/headers";
  import { NotLoggedIn } from "@/components/NotLoggedIn";
  import { NotPaid } from "@/components/NotPaid";
  import prisma from "@/lib/prisma";
  import { EmailNotVerified } from "@/components/EmailNotVerified";

  export default async function ElectionsPage() {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return <NotLoggedIn />;

    if (!session?.user.emailVerified && process.env.NODE_ENV !== "development")
      return <EmailNotVerified />;

    /*Use a direct prisma query to bypass the 60s cookie cache on session data*/
    const activeSubscription = await prisma.subscription.findFirst({
      where: { referenceId: session.user.id, status: "active" },
    });

    if (!activeSubscription) return <NotPaid />;

    return <ElectionCards />;
  }
  ```

- [ ] **Step 2: Type-check the entire project**

  ```bash
  cd joca-app && pnpm tsc --noEmit
  ```

  Expected: Zero errors. If any errors remain, they will reference `hasPaid` or `checkIfHasPaid` in files not yet updated - fix those before proceeding.

- [ ] **Step 3: Commit all page updates**

  ```bash
  cd joca-app && git add src/app/payment/StartPaymentPage.tsx src/app/payment/page.tsx src/app/payment/cancel/page.tsx src/app/payment/success/page.tsx src/app/elections/page.tsx && git commit -m "feat: replace hasPaid gating with subscription table queries across all pages"
  ```

---

## Chunk 4: Stripe Dashboard + Docs

### Task 11: Update Stripe Webhook Configuration

This is a manual step - no code changes.

- [ ] **Step 1: Update webhook URL in Stripe Dashboard**

  In the [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks:
  - Find the existing webhook pointing to `https://<your-domain>/api/webhooks/stripe`
  - Update the URL to: `https://<your-domain>/api/auth/stripe/webhook`
  - Ensure these events are enabled:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] **Step 2: Update local dev webhook forwarding**

  For local development, use the new path:

  ```bash
  stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
  ```

---

### Task 12: Update CLAUDE.local.md

**Files:**

- Modify: `joca-app/CLAUDE.local.md`

- [ ] **Step 1: Update the Payment Flow section**

  In `joca-app/CLAUDE.local.md`, replace the existing `## Payment Flow` section with:

  ```markdown
  ## Payment Flow

  Stripe membership payment flow (via `@better-auth/stripe` plugin):

  1. User clicks "Make Payment" on `/payment` - calls `subscription.upgrade({ plan: "membership", successUrl, cancelUrl })` from `auth-client.ts`
  2. Plugin creates a Stripe Checkout session and redirects user to Stripe's hosted page
  3. User completes payment on Stripe's hosted page
  4. Stripe fires webhook events to `/api/auth/stripe/webhook` (handled automatically by BetterAuth)
  5. Plugin creates a `subscription` record in the DB with `status: "active"`
  6. User is redirected to `/payment/success`, which queries `prisma.subscription.findFirst` to verify active status

  **Access gating:** `/elections` and payment pages query `prisma.subscription.findFirst({ where: { referenceId: userId, status: "active" } })` directly - bypasses the 60s cookie cache.

  **Grace period:** Stripe keeps `status: "active"` until `periodEnd` even after cancellation (`cancelAtPeriodEnd: true`), so the `status === "active"` check naturally handles the grace period.

  **Webhook endpoint:** `/api/auth/stripe/webhook` (auto-exposed by BetterAuth catch-all route at `api/auth/[...all]`).

  **Local webhook testing:** `stripe listen --forward-to localhost:3000/api/auth/stripe/webhook`

  **Payments are subscription-only** - configured in `auth.ts` stripe plugin with `plan: "membership"` and `priceId: process.env.STRIPE_PRICE_ID`.
  ```

  Also make these targeted updates elsewhere in `CLAUDE.local.md`:
  - In `## Architecture`, update the Payments line:
    - Old: `"Payments": Stripe (checkout sessions + webhook)`
    - New: `"Payments": Stripe via @better-auth/stripe plugin (hosted checkout + plugin-managed webhook)`

  - In `## Key Files` under `src/app/`, remove the `api/webhooks/stripe/` entry entirely.

  - In `## Key Files` under `src/lib/`, remove the `checkout.ts` entry entirely.

  - In `## Route Protection`, update the `/elections` description:
    - Old: "queries Prisma directly for `hasPaid` (not session, due to cookie cache)"
    - New: "queries Prisma directly for an active `subscription` record (not session, due to cookie cache)"

- [ ] **Step 2: Final build check**

  ```bash
  cd joca-app && pnpm build
  ```

  Expected: Build completes successfully with no TypeScript or compilation errors.
