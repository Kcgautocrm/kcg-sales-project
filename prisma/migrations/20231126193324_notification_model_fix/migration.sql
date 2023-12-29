/*
  Warnings:

  - Made the column `title` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "staffCadre" DROP NOT NULL,
ALTER COLUMN "staffCadre" DROP DEFAULT,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "viewedBy" SET DEFAULT ARRAY[]::TEXT[];
