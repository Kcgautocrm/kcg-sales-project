/*
  Warnings:

  - You are about to drop the `BrandEmployeesRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BrandEmployeesRelation" DROP CONSTRAINT "BrandEmployeesRelation_brandId_fkey";

-- DropForeignKey
ALTER TABLE "BrandEmployeesRelation" DROP CONSTRAINT "BrandEmployeesRelation_employeeId_fkey";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "brandsAssigned" TEXT[];

-- DropTable
DROP TABLE "BrandEmployeesRelation";
