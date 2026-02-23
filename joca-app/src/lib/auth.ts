import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { EmailVerificationTemplate } from "@/components/EmailVerificationTemplate";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "onboarding@resend.dev", //TODO: Change to JOCA email once prod domain is verified
        to: user.email,
        subject: "Verify your email",
        react: EmailVerificationTemplate({
          username: user.name,
          url,
        }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 600, //10 minutes
  },
  /* Rate Limiting:
  User cannot make more than 2 requests per minute to the API
  Prevents spam during signup/login/verification email resend
  */
  rateLimit: {
    enabled: true,
    max: 10, //max number of requests per window
    window: 60, //window in seconds

    //Limits signup requests & verification email resend requests to 5 per minute
    customRules: {
      "/signup": {
        max: 5,
        window: 60,
      },
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});
