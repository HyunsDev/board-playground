/*
  Warnings:

  - You are about to drop the column `managerId` on the `Board` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Board_managerId_idx";

-- AlterTable
ALTER TABLE "Board" DROP COLUMN "managerId",
ADD COLUMN     "creatorId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Board_slug_idx" ON "Board"("slug");
