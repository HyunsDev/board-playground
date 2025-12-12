/*
  Warnings:

  - A unique constraint covering the columns `[deviceIdentifier]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceIdentifier` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "deviceIdentifier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceIdentifier_key" ON "Device"("deviceIdentifier");
