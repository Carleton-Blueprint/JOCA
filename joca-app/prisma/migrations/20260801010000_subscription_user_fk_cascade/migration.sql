-- Remove orphaned subscription rows (no matching user) before adding the FK.
DELETE FROM "subscription" AS s
WHERE NOT EXISTS (
  SELECT 1 FROM "user" AS u WHERE u.id = s."referenceId"
);

-- Cascade-delete subscriptions (including Interac e-Transfer rows) when the user is deleted.
ALTER TABLE "subscription"
ADD CONSTRAINT "subscription_referenceId_fkey"
FOREIGN KEY ("referenceId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
