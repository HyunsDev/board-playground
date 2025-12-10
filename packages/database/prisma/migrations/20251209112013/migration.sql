/*
  Warnings:

  - Made the column `lastActiveAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastActiveAt" SET NOT NULL,
ALTER COLUMN "lastActiveAt" SET DEFAULT CURRENT_TIMESTAMP;
