/*
  Warnings:

  - You are about to drop the `ProductVisitReports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVisitReports" DROP CONSTRAINT "ProductVisitReports_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVisitReports" DROP CONSTRAINT "ProductVisitReports_visitReportId_fkey";

-- AlterTable
ALTER TABLE "VisitReport" ADD COLUMN     "productsDiscussed" TEXT[];

-- DropTable
DROP TABLE "ProductVisitReports";
