-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_senderId_fkey";

-- DropForeignKey
ALTER TABLE "ContactPerson" DROP CONSTRAINT "ContactPerson_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ContactPerson" DROP CONSTRAINT "ContactPerson_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_companyId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_brandId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_contactPersonId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_customerId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_pfiRequestFormId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequestForm" DROP CONSTRAINT "InvoiceRequestForm_productId_fkey";

-- DropForeignKey
ALTER TABLE "MarkettingActivity" DROP CONSTRAINT "MarkettingActivity_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PfiRequestForm" DROP CONSTRAINT "PfiRequestForm_contactPersonId_fkey";

-- DropForeignKey
ALTER TABLE "PfiRequestForm" DROP CONSTRAINT "PfiRequestForm_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PfiRequestForm" DROP CONSTRAINT "PfiRequestForm_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PriceMaster" DROP CONSTRAINT "PriceMaster_brandId_fkey";

-- DropForeignKey
ALTER TABLE "PriceMaster" DROP CONSTRAINT "PriceMaster_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_brandId_fkey";

-- DropForeignKey
ALTER TABLE "VisitReport" DROP CONSTRAINT "VisitReport_contactPersonId_fkey";

-- DropForeignKey
ALTER TABLE "VisitReport" DROP CONSTRAINT "VisitReport_customerId_fkey";

-- DropForeignKey
ALTER TABLE "VisitReport" DROP CONSTRAINT "VisitReport_employeeId_fkey";

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_pfiRequestFormId_fkey" FOREIGN KEY ("pfiRequestFormId") REFERENCES "PfiRequestForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkettingActivity" ADD CONSTRAINT "MarkettingActivity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
