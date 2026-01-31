import { createAuthClient } from 'better-auth/react'

// BetterAuth React Hooks 
//Exported specific methods from auth-client instantiation

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
})