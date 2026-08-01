-- AlterTable
ALTER TABLE "user" ADD COLUMN "requestedPlan" TEXT,
ADD COLUMN "approvedPlan" TEXT,
ADD COLUMN "membershipStatus" TEXT NOT NULL DEFAULT 'pending_approval';

-- Backfill existing paid members so they stay "approved"
UPDATE "user" AS u
SET
  "membershipStatus" = 'approved',
  "approvedPlan" = s.plan
FROM "subscription" AS s
WHERE s."referenceId" = u.id
  AND s.status = 'active';
