import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";
import type { CustomSession } from "./auth.types";

// BetterAuth React Hooks
//Exported specific methods from auth-client instantiation

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  updateUser,
  changePassword,
  deleteUser,
  subscription,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    stripeClient({
      subscription: true, //if you want to enable subscription management
    }),
  ],
});

// Type helper for useSession hook with custom fields
export function useTypedSession() {
  const session = useSession();
  return session as typeof session & { data: CustomSession | null };
}
