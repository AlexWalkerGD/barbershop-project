/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,day]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.
  - Made the column `employeeId` on table `Availability` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "employeeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Availability_employeeId_day_key" ON "Availability"("employeeId", "day");
