-- CreateEnum
CREATE TYPE "DeviceOS" AS ENUM ('ANDROID', 'IOS', 'WINDOWS', 'MACOS', 'LINUX', 'OTHER');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('WEB', 'OTHER');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedRefreshToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "os" "DeviceOS" NOT NULL DEFAULT 'OTHER',
    "platform" "DevicePlatform" NOT NULL DEFAULT 'OTHER',
    "ipAddress" TEXT NOT NULL,
    "location" TEXT,
    "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);
