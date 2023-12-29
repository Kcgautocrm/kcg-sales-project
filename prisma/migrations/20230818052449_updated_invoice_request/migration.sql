/*
  Warnings:

  - You are about to drop the column `vehicleBrandId` on the `InvoiceRequestForm` table. All the data in the column will be lost.
  - Made the column `approved` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `brandId` to the `InvoiceRequestForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_vehicleBrandId_fkey";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "approved" SET NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceRequestForm" DROP COLUMN "vehicleBrandId",
ADD COLUMN     "brandId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
