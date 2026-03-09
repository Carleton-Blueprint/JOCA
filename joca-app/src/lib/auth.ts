import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { EmailVerificationTemplate } from "@/components/EmailVerificationTemplate";
import prisma from "@/lib/prisma";

const isDev = process.env.NODE_ENV === "development";

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
      hasPaid: {
        type: "boolean",
        defaultValue: false,
        required: false,
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
    requireEmailVerification: !isDev,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await resend?.emails.send({
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
    sendOnSignUp: !isDev,
    autoSignInAfterVerification: true,
    expiresIn: 600, //10 minutes
  },
  /* Rate Limiting:
  User cannot make more than 10 requests per minute to the API
  Prevents spam during signup/login/verification email resend
  */
  rateLimit: {
    enabled: true,
    max: 20, //max number of requests per window
    window: 60, //window in seconds

    //Limits signup requests & verification email resend requests to 5 per minute
    customRules: {
      "/signup": {
        max: 20,
        window: 60,
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
