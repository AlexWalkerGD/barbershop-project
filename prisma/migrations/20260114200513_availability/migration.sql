-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "startHour" TEXT NOT NULL,
    "endHour" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);
