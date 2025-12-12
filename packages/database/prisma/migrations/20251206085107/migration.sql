/*
  Warnings:

  - You are about to drop the column `lastUsedAt` on the `Session` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lastUsedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
