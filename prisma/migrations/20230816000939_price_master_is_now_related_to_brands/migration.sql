/*
  Warnings:

  - You are about to drop the column `brandName` on the `PriceMaster` table. All the data in the column will be lost.
  - The `anyPromo` column on the `PriceMaster` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `approved` on table `PfiRequestForm` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brandId` to the `PriceMaster` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvoiceRequestForm" ALTER COLUMN "dateOfPayment" SET DATA TYPE TEXT,
ALTER COLUMN "paymentDueDate" SET DATA TYPE TEXT,
ALTER COLUMN "invoiceDate" SET DATA TYPE TEXT,
ALTER COLUMN "actualDeliveryDate" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PfiRequestForm" ADD COLUMN     "locked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "relationshipWithTransaction" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "approved" SET NOT NULL;

-- AlterTable
ALTER TABLE "PriceMaster" DROP COLUMN "brandName",
ADD COLUMN     "brandId" TEXT NOT NULL,
ADD COLUMN     "promoText" VARCHAR(255),
DROP COLUMN "anyPromo",
ADD COLUMN     "anyPromo" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
