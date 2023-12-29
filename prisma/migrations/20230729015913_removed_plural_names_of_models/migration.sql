/*
  Warnings:

  - You are about to drop the `Comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MarkettingActivities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonthlyTargets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MarkettingActivities" DROP CONSTRAINT "MarkettingActivities_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "MonthlyTargets" DROP CONSTRAINT "MonthlyTargets_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_receiverId_fkey";

-- DropTable
DROP TABLE "Comments";

-- DropTable
DROP TABLE "MarkettingActivities";

-- DropTable
DROP TABLE "MonthlyTargets";

-- DropTable
DROP TABLE "Notifications";

-- CreateTable
CREATE TABLE "MarkettingActivity" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "activityName" VARCHAR(50) NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "participants" VARCHAR(255),
    "location" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "targetResult" TEXT NOT NULL,
    "briefReport" VARCHAR(1000) NOT NULL,
    "pictures" TEXT[],
    "costIncurred" VARCHAR(50) NOT NULL,
    "pdfDetails" VARCHAR(255),
    "approved" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkettingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTarget" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" VARCHAR(50) NOT NULL,
    "monthlyTarget" JSONB,
    "planForMonth" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceUrl" TEXT,
    "message" TEXT,
    "viewed" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceUrl" TEXT,
    "message" TEXT,
    "viewed" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MarkettingActivity" ADD CONSTRAINT "MarkettingActivity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTarget" ADD CONSTRAINT "MonthlyTarget_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
