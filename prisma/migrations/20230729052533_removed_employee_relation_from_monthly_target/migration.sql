/*
  Warnings:

  - You are about to drop the column `employeeId` on the `MonthlyTarget` table. All the data in the column will be lost.
  - Made the column `monthlyTarget` on table `MonthlyTarget` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MonthlyTarget" DROP CONSTRAINT "MonthlyTarget_employeeId_fkey";

-- AlterTable
ALTER TABLE "MonthlyTarget" DROP COLUMN "employeeId",
ALTER COLUMN "monthlyTarget" SET NOT NULL,
ALTER COLUMN "monthlyTarget" SET DATA TYPE TEXT;
