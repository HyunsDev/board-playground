/*
  Warnings:

  - You are about to drop the column `deviceIdentifier` on the `Device` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Device_deviceIdentifier_key";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "deviceIdentifier";
