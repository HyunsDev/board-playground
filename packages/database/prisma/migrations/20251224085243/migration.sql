/*
  Warnings:

  - Added the required column `appointedById` to the `Manager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manager" ADD COLUMN     "appointedById" UUID NOT NULL;
