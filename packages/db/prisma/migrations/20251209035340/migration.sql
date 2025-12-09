/*
  Warnings:

  - You are about to drop the column `memo` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "memo",
ADD COLUMN     "adminMemo" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lastActiveAt" TIMESTAMP(3);
