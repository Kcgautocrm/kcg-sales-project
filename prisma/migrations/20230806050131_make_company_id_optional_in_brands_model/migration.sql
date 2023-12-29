-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_companyId_fkey";

-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
