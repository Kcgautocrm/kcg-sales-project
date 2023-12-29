/*
  Warnings:

  - You are about to drop the column `customerAddress` on the `PfiRequestForm` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `PfiRequestForm` table. All the data in the column will be lost.
  - You are about to drop the column `existingCustomer` on the `PfiRequestForm` table. All the data in the column will be lost.
  - Added the required column `customerType` to the `PfiRequestForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PfiRequestForm" DROP COLUMN "customerAddress",
DROP COLUMN "customerName",
DROP COLUMN "existingCustomer",
ADD COLUMN     "companyAddress" VARCHAR(255),
ADD COLUMN     "companyName" VARCHAR(50),
ADD COLUMN     "customerType" TEXT NOT NULL;
