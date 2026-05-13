ALTER TABLE "Promotion"
ADD COLUMN "endsAt" TIMESTAMP(3);

UPDATE "Promotion"
SET "endsAt" = CURRENT_TIMESTAMP + INTERVAL '30 days'
WHERE "endsAt" IS NULL;

ALTER TABLE "Promotion"
ALTER COLUMN "endsAt" SET NOT NULL;

ALTER TABLE "Promotion"
ADD COLUMN "serviceId" TEXT;

ALTER TABLE "Promotion"
DROP COLUMN "appliesTo";

ALTER TABLE "Promotion"
ADD CONSTRAINT "Promotion_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "BarbershopService"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
