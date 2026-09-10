-- Mandatory +91 phone gate, pincode + order snapshot, Sale flag, WhatsApp log.
-- Idempotent (IF NOT EXISTS) because the live DB was already synced via `prisma db push`.

-- Customer: pincode + marketing opt-in (separate from mandatory order phone)
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "whatsappMarketingOptIn" BOOLEAN NOT NULL DEFAULT false;

-- Product: Sale membership flag (category stays intact)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isOnSale" BOOLEAN NOT NULL DEFAULT false;

-- Backfill Sale from legacy badge (Frames keep category="Frames")
UPDATE "Product" SET "isOnSale" = true WHERE "badge" = 'SALE' AND ("isOnSale" IS DISTINCT FROM true);

-- Order: delivery snapshot at order time
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingName" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingPhone" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingPincode" TEXT;

-- WhatsApp automation log (provider-agnostic, idempotency)
CREATE TABLE IF NOT EXISTS "WhatsappEvent" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "orderNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SKIPPED_DISABLED',
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsappEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WhatsappEvent_phone_event_orderNumber_idx" ON "WhatsappEvent"("phone", "event", "orderNumber");
