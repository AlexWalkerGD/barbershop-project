ALTER TABLE "EmployeeDayOff"
ADD COLUMN "allDay" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "startHour" TEXT,
ADD COLUMN "endHour" TEXT;

DROP INDEX IF EXISTS "EmployeeDayOff_employeeId_date_key";
