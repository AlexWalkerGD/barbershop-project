CREATE TABLE "EmployeeDayOff" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDayOff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmployeeDayOff_employeeId_date_key"
ON "EmployeeDayOff"("employeeId", "date");
