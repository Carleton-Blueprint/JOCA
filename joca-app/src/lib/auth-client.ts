import { useRef } from "react";
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

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

// Returns isPending: true only on the initial load, not on background re-fetches.
// Prevents loader flickers when the session re-validates on window focus.
export function useSessionReady() {
  const session = useSession();
  const initialized = useRef(false);
  if (!session.isPending) initialized.current = true;
  return { ...session, isPending: !initialized.current };
}
