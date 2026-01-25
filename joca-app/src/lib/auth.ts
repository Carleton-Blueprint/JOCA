import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'

// BetterAuth configuration to use primsa adapter

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
   emailAndPassword: {
    enabled: true,
    },
    trustedOrigins: ['http://localhost:3001'],
})