-- Widen money columns from DECIMAL(10,2) to DECIMAL(14,2) to support large property prices.
-- Safe widen: no data loss.

ALTER TABLE "properties" ALTER COLUMN "monthlyRent" TYPE DECIMAL(14,2);
ALTER TABLE "properties" ALTER COLUMN "salePrice" TYPE DECIMAL(14,2);

ALTER TABLE "owner_listings" ALTER COLUMN "askingPrice" TYPE DECIMAL(14,2);
ALTER TABLE "owner_listings" ALTER COLUMN "monthlyRent" TYPE DECIMAL(14,2);

ALTER TABLE "leases" ALTER COLUMN "rentAmount" TYPE DECIMAL(14,2);
ALTER TABLE "leases" ALTER COLUMN "depositAmount" TYPE DECIMAL(14,2);

ALTER TABLE "rent_revisions" ALTER COLUMN "previousRent" TYPE DECIMAL(14,2);
ALTER TABLE "rent_revisions" ALTER COLUMN "newRent" TYPE DECIMAL(14,2);

ALTER TABLE "rent_payments" ALTER COLUMN "amount" TYPE DECIMAL(14,2);
