/*
  Warnings:

  - You are about to drop the column `nextVisitDate` on the `VisitReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VisitReport" DROP COLUMN "nextVisitDate",
ADD COLUMN     "followUpVisits" JSONB[];
