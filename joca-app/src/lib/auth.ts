import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { EmailVerificationTemplate } from "@/components/EmailVerificationTemplate";
import prisma from "@/lib/prisma";
import { deleteMemberByEmail } from "@/lib/actions";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

const isDev = process.env.NODE_ENV === "development";

if (!isDev && !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set.");
}

const resendApiKey = process.env.RESEND_API_KEY;
if (!isDev && !resendApiKey) {
  throw new Error("RESEND_API_KEY environment variable is not set.");
}

const resend = isDev ? null : new Resend(resendApiKey!);

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
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user: { id: string; email: string }) => {
        // Cancel active Stripe subscription before deleting the user,
        // otherwise Stripe will continue billing the card indefinitely.
        const sub = await prisma.subscription.findUnique({
          where: { referenceId: user.id },
          select: { stripeSubscriptionId: true, status: true },
        });
        if (sub?.status === "active" && sub?.stripeSubscriptionId) {
          await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId);
        }
        // Clean up subscription record - no FK cascade since referenceId
        // has no @relation to User.
        //Add check to prevent throwing error if it doesn't exist
        if (sub) {
          await prisma.subscription.delete({
            where: { referenceId: user.id },
          });
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
  session: {
    expiresIn: 36000, //10 hours
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
          from: "onboarding@resend.dev", //TODO: Change to JOCA email once prod domain is verified
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
    autoSignInAfterVerification: true,
    expiresIn: 600, //10 minutes
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
