-- Make customer email optional: schema declares User.email / Customer.email
-- as String? but the live DB columns are still NOT NULL (drift from the
-- initial migration, which created them as TEXT NOT NULL). This only
-- relaxes the NOT NULL constraint; no data is changed or deleted.
-- NOTE: other schema/DB drift (OtpCode table, phone constraints) is
-- intentionally left untouched by this migration.
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;
