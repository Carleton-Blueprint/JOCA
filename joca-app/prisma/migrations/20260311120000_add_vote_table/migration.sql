-- CreateTable
CREATE TABLE "vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "anonId" TEXT,
    "electionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vote_userId_electionId_key" ON "vote"("userId", "electionId");

-- CreateIndex
CREATE UNIQUE INDEX "vote_anonId_electionId_key" ON "vote"("anonId", "electionId");

-- CreateIndex
CREATE INDEX "vote_electionId_idx" ON "vote"("electionId");

-- CreateIndex
CREATE INDEX "vote_candidateId_idx" ON "vote"("candidateId");

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

