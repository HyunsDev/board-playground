-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "revokedAt" TIMESTAMP(3);
