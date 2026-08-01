import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { EmailVerificationTemplate } from "@/components/EmailVerificationTemplate";
import prisma from "@/lib/prisma";
import { deleteMemberByEmail } from "@/lib/strapi";
import { createAuthMiddleware } from "better-auth/api";
import { SESSION_FRESH_AGE_SECONDS } from "@/lib/auth-constants";
import { EMAIL_FROM, resend } from "@/lib/resend";
import { notifyJocaOfMembershipApplication } from "@/lib/membership-notify";
import { MEMBERSHIP_STATUS } from "@/lib/membership-plans";
import { isEmailVerificationSkipped } from "@/lib/email-verification";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

const isDev = process.env.NODE_ENV === "development";

if (!isDev && !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set.");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: true,
      },
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      requestedPlan: {
        type: "string",
        required: true,
      },
      approvedPlan: {
        type: "string",
        required: false,
      },
      membershipStatus: {
        type: "string",
        required: false,
        defaultValue: MEMBERSHIP_STATUS.PENDING_APPROVAL,
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user: { id: string; email: string }) => {
        // Find the subscription record
        const sub = await prisma.subscription.findUnique({
          where: { referenceId: user.id },
          select: { stripeSubscriptionId: true, status: true },
        });
        if (sub) {
          // Cancel Stripe first whenever a live subscription id exists.
          // Abort account deletion if cancel fails so billing cannot outlive the user.
          const shouldCancelStripe =
            Boolean(sub.stripeSubscriptionId) &&
            sub.status !== "canceled" &&
            sub.status !== "ended";

          if (shouldCancelStripe && sub.stripeSubscriptionId) {
            try {
              await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId);
            } catch (error) {
              console.error(
                `[BILLING ALERT] Stripe cancellation failed for user ${user.id}. ` +
                  `Aborting account deletion. Stripe subscription ${sub.stripeSubscriptionId}.`,
                error,
              );
              throw new Error(
                "Unable to cancel your Stripe subscription. Please try again or contact support.",
              );
            }
          }

          try {
            await prisma.subscription.delete({
              where: { referenceId: user.id },
            });
          } catch (error) {
            console.error(
              `Failed to delete subscription record for user ${user.id}:`,
              error,
            );
            throw error;
          }
        }
        // Delete corresponding Strapi member record.
        try {
          await deleteMemberByEmail(user.email);
        } catch (error) {
          console.error("Failed to delete Strapi member:", error);
        }
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // When verification is skipped, notify JOCA immediately (afterEmailVerification will not run).
          if (isEmailVerificationSkipped()) {
            await notifyJocaOfMembershipApplication(user.id);
          }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as { email?: string } | undefined;
        const email = body?.email;
        if (email) {
          // If a previous unverified signup exists for this email, remove it
          // so the real owner can always sign up. Verified accounts are left
          // untouched so "email already in use" still fires for them.
          const existing = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true },
          });
          if (existing && !existing.emailVerified) {
            await prisma.user
              .delete({ where: { id: existing.id } })
              .catch((error) => {
                if (error.code !== "P2025") {
                  // Prisma P2025 - record not found (shallow this error)
                  console.error(
                    "Error deleting existing unverified signup: ",
                    error,
                  );
                  throw error;
                }
                // Record already deleted by concurrent request - safe to proceed
              });
          }
        }
      }
    }),
  },
  session: {
    expiresIn: 36000, //10 hours
    // Sensitive ops (e.g. password change / account deletion without password)
    // require a session created within this window.
    freshAge: SESSION_FRESH_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: 60, //1 minute
      strategy: "compact",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:
      process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== "true",
  },
  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      if (!resend) {
        throw new Error(
          "Resend client not configured. Email verification is disabled.",
        );
      }
      try {
        await resend.emails.send({
          from: EMAIL_FROM, //TODO: Change to JOCA email once prod domain is verified
          to: user.email,
          subject: "Verify your email",
          react: EmailVerificationTemplate({
            username: user.name,
            url,
          }),
        });
      } catch (error) {
        throw new Error("Failed to send verification email");
      }
    },
    sendOnSignUp: process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== "true",
    sendOnSignIn: process.env.NEXT_PUBLIC_SKIP_EMAIL_VERIFICATION !== "true",
    autoSignInAfterVerification: true,
    expiresIn: 3600, //1 hour
    afterEmailVerification: async (user: { id: string }) => {
      await notifyJocaOfMembershipApplication(user.id);
    },
  },
  /* Rate Limiting:
  User cannot make more than 100 requests per minute to the API
  Prevents spam during signup/login/verification email resend
  */
  rateLimit: {
    enabled: true,
    max: 100, //max number of requests per window
    window: 60, //window in seconds
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      subscription: {
        enabled: true,
        plans: [
          {
            name: "senior-membership",
            lookupKey: "senior-membership",
          },
          {
            name: "general-membership",
            lookupKey: "general-membership",
          },
          {
            name: "family-membership",
            lookupKey: "family-membership",
          },
          {
            name: "student-associate-membership",
            lookupKey: "student-associate-membership",
          },
        ],
      },
    }),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
