import { Resend } from "resend";

const isDev = process.env.NODE_ENV === "development";

const resendApiKey = process.env.RESEND_API_KEY;
if (!isDev && !resendApiKey) {
  throw new Error("RESEND_API_KEY environment variable is not set.");
}

/** Null in development when Resend isn't configured; production always has a client. */
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/** Temporary until JOCA domain is verified in Resend. */
export const EMAIL_FROM = "onboarding@resend.dev";
