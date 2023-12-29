-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_supervisorId_fkey";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "supervisorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
