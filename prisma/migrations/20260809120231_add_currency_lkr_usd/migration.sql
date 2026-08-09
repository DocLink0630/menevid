-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('LKR', 'USD');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'LKR';

-- AlterTable
ALTER TABLE "owner_listings" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'LKR';

-- AlterTable
ALTER TABLE "leases" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'LKR';
