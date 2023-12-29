/*
  Warnings:

  - Made the column `message` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_receiverId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "staffCadre" TEXT NOT NULL DEFAULT 'salesPerson',
ALTER COLUMN "receiverId" DROP NOT NULL,
ALTER COLUMN "message" SET NOT NULL;
