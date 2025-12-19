/*
  Warnings:

  - Added the required column `originalName` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileAccessType" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "accessType" "FileAccessType" NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN     "originalName" TEXT NOT NULL;
