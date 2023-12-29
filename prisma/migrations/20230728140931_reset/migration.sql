-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(50) NOT NULL,
    "logo" VARCHAR(255),
    "email" VARCHAR(50) NOT NULL,
    "address" VARCHAR(255),
    "brands" JSONB[],
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "lga" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(255),
    "address" VARCHAR(255) NOT NULL,
    "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" VARCHAR(50),
    "email" VARCHAR(50) NOT NULL,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50),
    "description" VARCHAR(255),
    "logo" VARCHAR(255),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50),
    "brandId" TEXT NOT NULL,
    "description" VARCHAR(255),
    "specifications" VARCHAR(255),
    "brochures" TEXT[],
    "images" VARCHAR(255)[],
    "vatInclusive" BOOLEAN DEFAULT false,
    "vatRate" VARCHAR(255),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceMaster" (
    "id" TEXT NOT NULL,
    "unitPrice" VARCHAR(50) NOT NULL,
    "promoPrice" VARCHAR(50),
    "anyPromo" VARCHAR(255),
    "validFrom" TIMESTAMP(3),
    "validTill" TIMESTAMP(3),
    "brandName" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "staffCadre" TEXT[] DEFAULT ARRAY['salesPerson']::TEXT[],
    "branchId" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "middleName" VARCHAR(50),
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "employmentDate" VARCHAR(255),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandEmployeesRelation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandEmployeesRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyName" VARCHAR(50) NOT NULL,
    "state" VARCHAR(50),
    "lga" VARCHAR(50),
    "city" VARCHAR(50),
    "address" VARCHAR(255),
    "companyWebsite" VARCHAR(50),
    "industry" VARCHAR(50),
    "customerType" VARCHAR(50),
    "enquirySource" VARCHAR(50),
    "status" VARCHAR(255) DEFAULT 'cold',
    "approved" BOOLEAN DEFAULT false,
    "lastVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50),
    "email" VARCHAR(50),
    "designation" VARCHAR(50),
    "department" VARCHAR(50),
    "phoneNumber" VARCHAR(50) NOT NULL,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitReport" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contactPersonId" TEXT NOT NULL,
    "callType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "quantity" VARCHAR(50),
    "durationOfMeeting" VARCHAR(50) NOT NULL,
    "meetingOutcome" VARCHAR(255),
    "visitDate" TIMESTAMP(3),
    "nextVisitDate" TIMESTAMP(3),
    "pfiRequest" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVisitReports" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "visitReportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVisitReports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PfiRequestForm" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "contactPersonId" TEXT,
    "existingCustomer" BOOLEAN NOT NULL DEFAULT false,
    "customerName" VARCHAR(50),
    "customerAddress" VARCHAR(255),
    "contactPersonName" VARCHAR(50),
    "phoneNumber" VARCHAR(50),
    "emailAddress" VARCHAR(50),
    "brandId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" TEXT,
    "pricePerVehicle" TEXT,
    "bodyTypeDescription" VARCHAR(255),
    "vehicleServiceDetails" VARCHAR(255),
    "specialFitmentDetails" VARCHAR(255),
    "costForSpecialFitment" VARCHAR(50),
    "discount" TEXT,
    "vatDeduction" BOOLEAN NOT NULL DEFAULT false,
    "whtDeduction" BOOLEAN NOT NULL DEFAULT false,
    "registration" BOOLEAN NOT NULL DEFAULT false,
    "refundRebateAmount" VARCHAR(50),
    "refundRebaseRecipient" VARCHAR(50),
    "designation" VARCHAR(50),
    "relationshipWithTransaction" VARCHAR(50),
    "estimatedOrderClosingTime" VARCHAR(50),
    "paymentType" VARCHAR(50),
    "deliveryLocation" VARCHAR(255),
    "vehicleDetails" VARCHAR(255),
    "approved" BOOLEAN DEFAULT false,
    "pfiReferenceNumber" TEXT,
    "pfiDate" TIMESTAMP(3),
    "additionalInformation" VARCHAR(255),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PfiRequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRequestForm" (
    "id" TEXT NOT NULL,
    "pfiRequestFormId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "contactPersonId" TEXT,
    "invoiceName" VARCHAR(50),
    "address" VARCHAR(255),
    "contactOfficeTelephone" VARCHAR(50),
    "emailAddress" VARCHAR(50),
    "salesThru" VARCHAR(50),
    "industry" VARCHAR(50),
    "vehicleBrandId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vehicleModelDetails" VARCHAR(255),
    "quantity" VARCHAR(50),
    "color" VARCHAR(50),
    "totalInvoiceValuePerVehicle" VARCHAR(50),
    "typeOfBodyBuilding" VARCHAR(255),
    "bodyFabricatorName" VARCHAR(255),
    "registration" VARCHAR(50),
    "vatDeduction" BOOLEAN NOT NULL DEFAULT false,
    "whtDeduction" BOOLEAN NOT NULL DEFAULT false,
    "rebateAmount" VARCHAR(50),
    "refundToCustomer" VARCHAR(50),
    "servicePackageDetails" VARCHAR(255),
    "rebateReceiver" VARCHAR(50),
    "relationshipWithTransaction" VARCHAR(50),
    "expectedDeliveryDate" VARCHAR(50),
    "deliveryLocation" VARCHAR(255),
    "deliveredBy" VARCHAR(50),
    "paymentStatus" VARCHAR(50),
    "bankName" VARCHAR(50),
    "bankAccountName" VARCHAR(50),
    "accountNumber" VARCHAR(50),
    "amountPaid" VARCHAR(50),
    "dateOfPayment" TIMESTAMP(3),
    "lpoNumber" VARCHAR(50),
    "paymentDueDate" TIMESTAMP(3),
    "otherPaymentDetails" VARCHAR(255),
    "invoiceNumber" VARCHAR(50),
    "invoiceDate" TIMESTAMP(3),
    "deliveryNoteNumber" VARCHAR(50),
    "actualDeliveryDate" TIMESTAMP(3),
    "chasisNumber" VARCHAR(50),
    "delivery" TEXT NOT NULL DEFAULT 'pending',
    "payment" TEXT,
    "approved" BOOLEAN DEFAULT false,
    "approvedByGM" BOOLEAN DEFAULT false,
    "approvedByProductHead" BOOLEAN NOT NULL DEFAULT false,
    "additionalInformation" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceRequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkettingActivities" (
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

    CONSTRAINT "MarkettingActivities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTargets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" VARCHAR(50) NOT NULL,
    "monthlyTarget" JSONB,
    "planForMonth" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTargets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comments" (
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

    CONSTRAINT "Comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceUrl" TEXT,
    "message" TEXT,
    "viewed" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_code_key" ON "Brand"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PriceMaster_productId_key" ON "PriceMaster"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRequestForm_pfiRequestFormId_key" ON "InvoiceRequestForm"("pfiRequestFormId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandEmployeesRelation" ADD CONSTRAINT "BrandEmployeesRelation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandEmployeesRelation" ADD CONSTRAINT "BrandEmployeesRelation_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVisitReports" ADD CONSTRAINT "ProductVisitReports_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVisitReports" ADD CONSTRAINT "ProductVisitReports_visitReportId_fkey" FOREIGN KEY ("visitReportId") REFERENCES "VisitReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_pfiRequestFormId_fkey" FOREIGN KEY ("pfiRequestFormId") REFERENCES "PfiRequestForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_vehicleBrandId_fkey" FOREIGN KEY ("vehicleBrandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkettingActivities" ADD CONSTRAINT "MarkettingActivities_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTargets" ADD CONSTRAINT "MonthlyTargets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
