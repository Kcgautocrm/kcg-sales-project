/*
  Warnings:

  - Made the column `approved` on table `InvoiceRequestForm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedByGM` on table `InvoiceRequestForm` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InvoiceRequestForm" ALTER COLUMN "approved" SET NOT NULL,
ALTER COLUMN "approvedByGM" SET NOT NULL;
