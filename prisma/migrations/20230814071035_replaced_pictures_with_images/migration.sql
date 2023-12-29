/*
  Warnings:

  - You are about to drop the column `pictures` on the `MarkettingActivity` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyTarget` on the `MonthlyTarget` table. All the data in the column will be lost.
  - You are about to drop the column `planForMonth` on the `MonthlyTarget` table. All the data in the column will be lost.
  - Added the required column `target` to the `MonthlyTarget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MarkettingActivity" DROP COLUMN "pictures",
ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "MonthlyTarget" DROP COLUMN "monthlyTarget",
DROP COLUMN "planForMonth",
ADD COLUMN     "target" TEXT NOT NULL;
