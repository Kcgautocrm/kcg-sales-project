-- AlterTable
ALTER TABLE "Branch" ALTER COLUMN "lga" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MarkettingActivity" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "objective" DROP NOT NULL,
ALTER COLUMN "targetResult" DROP NOT NULL,
ALTER COLUMN "briefReport" DROP NOT NULL,
ALTER COLUMN "costIncurred" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PriceMaster" ADD COLUMN     "vatInclusive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "VisitReport" ALTER COLUMN "callType" DROP NOT NULL;
