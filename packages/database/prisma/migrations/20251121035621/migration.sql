/*
  Warnings:

  - The `os` column on the `Device` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "browser" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "device" TEXT NOT NULL DEFAULT 'OTHER',
DROP COLUMN "os",
ADD COLUMN     "os" TEXT NOT NULL DEFAULT 'OTHER',
ALTER COLUMN "ipAddress" DROP NOT NULL;

-- DropEnum
DROP TYPE "DeviceOS";
