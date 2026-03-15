-- AlterTable
ALTER TABLE "user" DROP COLUMN IF EXISTS "hasPaid";

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "billingInterval" TEXT,
    "seats" INTEGER,
    "stripeScheduleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex (moved from 20260314215529 which ran before this table was created)
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_referenceId_key" ON "subscription"("referenceId");
