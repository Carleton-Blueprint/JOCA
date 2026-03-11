/*
  Warnings:

  - You are about to drop the column `anonId` on the `vote` table. All the data in the column will be lost.
  - Made the column `userId` on table `vote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "vote_anonId_electionId_key";

-- AlterTable
ALTER TABLE "vote" DROP COLUMN "anonId",
ALTER COLUMN "userId" SET NOT NULL;
