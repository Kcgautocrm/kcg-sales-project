/*
  Warnings:

  - You are about to drop the column `companyId` on the `Brand` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_companyId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "companyId";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "brands" TEXT[];
