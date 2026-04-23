-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('REVENUE', 'CLIENTS');

-- AlterTable
ALTER TABLE "Barbershop" ADD COLUMN     "monthlyGoalType" "GoalType",
ADD COLUMN     "monthlyGoalValue" INTEGER;
