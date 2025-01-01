-- CreateTable
CREATE TABLE "VerifiedLocations" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "longitude" TEXT NOT NULL,
    "lattitude" TEXT NOT NULL,
    "timeStamp" TEXT NOT NULL,
    "description" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifiedLocations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VerifiedLocations" ADD CONSTRAINT "VerifiedLocations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifiedLocations" ADD CONSTRAINT "VerifiedLocations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
