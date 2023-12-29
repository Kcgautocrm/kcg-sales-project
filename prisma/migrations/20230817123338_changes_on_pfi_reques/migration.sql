/*
  Warnings:

  - You are about to drop the column `refundRebaseRecipient` on the `PfiRequestForm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PfiRequestForm" DROP COLUMN "refundRebaseRecipient",
ADD COLUMN     "refundRebateRecipient" VARCHAR(50),
ALTER COLUMN "pfiDate" SET DATA TYPE TEXT;
