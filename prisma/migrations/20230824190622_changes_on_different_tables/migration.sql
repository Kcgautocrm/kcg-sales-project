/*
  Warnings:

  - You are about to alter the column `status` on the `Customer` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.
  - You are about to alter the column `employmentDate` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.
  - You are about to alter the column `vatRate` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "address" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "address" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "address" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "employmentDate" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "InvoiceRequestForm" ALTER COLUMN "address" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "vehicleModelDetails" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "typeOfBodyBuilding" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "bodyFabricatorName" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "deliveryLocation" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "otherPaymentDetails" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "chasisNumber" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "MarkettingActivity" ALTER COLUMN "participants" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "pdfDetails" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "PfiRequestForm" ALTER COLUMN "bodyTypeDescription" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "vehicleServiceDetails" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "specialFitmentDetails" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "deliveryLocation" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "vehicleDetails" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "additionalInformation" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "companyAddress" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "PriceMaster" ALTER COLUMN "promoText" SET DATA TYPE VARCHAR(1000);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "specifications" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "images" SET DATA TYPE VARCHAR(2000)[],
ALTER COLUMN "vatRate" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "VisitReport" ALTER COLUMN "meetingOutcome" SET DATA TYPE VARCHAR(1000);
