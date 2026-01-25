import { createAuthClient } from 'better-auth/react'

// BetterAuth React Hooks 
//Exported specific methods from auth-client instantiation

export const { signIn, signUp, signOut, useSession } = createAuthClient()