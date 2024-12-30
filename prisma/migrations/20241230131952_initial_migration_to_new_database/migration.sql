-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50),
    "name" VARCHAR(50) NOT NULL,
    "logo" VARCHAR(255),
    "email" VARCHAR(50),
    "address" VARCHAR(1000),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brands" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "lga" VARCHAR(50),
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(255),
    "address" VARCHAR(1000) NOT NULL,
    "isHeadOffice" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" VARCHAR(50),
    "email" VARCHAR(50),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50),
    "description" VARCHAR(1000),
    "logo" VARCHAR(255),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50),
    "brandId" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "specifications" VARCHAR(1000),
    "brochures" TEXT[],
    "images" VARCHAR(2000)[],
    "vatInclusive" BOOLEAN DEFAULT false,
    "vatRate" VARCHAR(50),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceMaster" (
    "id" TEXT NOT NULL,
    "unitPrice" VARCHAR(50) NOT NULL,
    "promoPrice" VARCHAR(50),
    "validFrom" TEXT,
    "validTill" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,
    "promoText" VARCHAR(1000),
    "anyPromo" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vatInclusive" BOOLEAN NOT NULL DEFAULT false,
    "vatRate" TEXT,

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
    "supervisorId" TEXT,
    "employmentDate" VARCHAR(50),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandsAssigned" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyName" VARCHAR(50) NOT NULL,
    "state" VARCHAR(50),
    "lga" VARCHAR(50),
    "city" VARCHAR(50),
    "address" VARCHAR(1000),
    "companyWebsite" VARCHAR(50),
    "industry" VARCHAR(50),
    "customerType" VARCHAR(50),
    "enquirySource" VARCHAR(50),
    "status" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "lastVisited" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPerson" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "email" VARCHAR(50),
    "designation" VARCHAR(50),
    "phoneNumber" VARCHAR(50) NOT NULL,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContactPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitReport" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contactPersonId" TEXT NOT NULL,
    "callType" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL,
    "quantity" VARCHAR(50),
    "durationOfMeeting" VARCHAR(50) NOT NULL,
    "meetingOutcome" VARCHAR(1000),
    "visitDate" TEXT,
    "pfiRequest" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "followUpVisits" JSONB[],
    "productsDiscussed" TEXT[],
    "nextVisitDate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VisitReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PfiRequestForm" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT,
    "contactPersonId" TEXT,
    "contactPersonName" VARCHAR(50),
    "phoneNumber" VARCHAR(50),
    "emailAddress" VARCHAR(50),
    "brandId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" TEXT,
    "pricePerVehicle" TEXT,
    "bodyTypeDescription" VARCHAR(1000),
    "vehicleServiceDetails" VARCHAR(1000),
    "specialFitmentDetails" VARCHAR(1000),
    "costForSpecialFitment" VARCHAR(50),
    "discount" TEXT,
    "vatDeduction" BOOLEAN NOT NULL DEFAULT false,
    "whtDeduction" BOOLEAN NOT NULL DEFAULT false,
    "registration" BOOLEAN NOT NULL DEFAULT false,
    "refundRebateAmount" VARCHAR(50),
    "designation" VARCHAR(50),
    "relationshipWithTransaction" VARCHAR(255),
    "estimatedOrderClosingTime" VARCHAR(50),
    "paymentType" VARCHAR(50),
    "deliveryLocation" VARCHAR(1000),
    "vehicleDetails" VARCHAR(1000),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "pfiReferenceNumber" TEXT,
    "pfiDate" TEXT,
    "additionalInformation" VARCHAR(1000),
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "companyAddress" VARCHAR(1000),
    "companyName" VARCHAR(50),
    "customerType" TEXT NOT NULL,
    "refundRebateRecipient" VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

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
    "address" VARCHAR(1000),
    "contactOfficeTelephone" VARCHAR(50),
    "emailAddress" VARCHAR(50),
    "salesThru" VARCHAR(50),
    "industry" VARCHAR(50),
    "productId" TEXT NOT NULL,
    "vehicleModelDetails" VARCHAR(1000),
    "quantity" VARCHAR(50),
    "color" VARCHAR(50),
    "totalInvoiceValuePerVehicle" VARCHAR(50),
    "typeOfBodyBuilding" VARCHAR(1000),
    "bodyFabricatorName" VARCHAR(1000),
    "registration" VARCHAR(50),
    "vatDeduction" BOOLEAN NOT NULL DEFAULT false,
    "whtDeduction" BOOLEAN NOT NULL DEFAULT false,
    "rebateAmount" VARCHAR(50),
    "refundToCustomer" VARCHAR(50),
    "servicePackageDetails" VARCHAR(255),
    "rebateReceiver" VARCHAR(50),
    "relationshipWithTransaction" VARCHAR(50),
    "expectedDeliveryDate" VARCHAR(50),
    "deliveryLocation" VARCHAR(1000),
    "deliveredBy" VARCHAR(50),
    "paymentStatus" VARCHAR(50),
    "bankName" VARCHAR(50),
    "bankAccountName" VARCHAR(50),
    "accountNumber" VARCHAR(50),
    "amountPaid" VARCHAR(50),
    "dateOfPayment" TEXT,
    "lpoNumber" VARCHAR(50),
    "paymentDueDate" TEXT,
    "otherPaymentDetails" VARCHAR(1000),
    "invoiceNumber" VARCHAR(50),
    "invoiceDate" TEXT,
    "deliveryNoteNumber" VARCHAR(2000),
    "actualDeliveryDate" TEXT,
    "chasisNumber" VARCHAR(2000),
    "delivery" TEXT NOT NULL DEFAULT 'pending',
    "payment" TEXT DEFAULT 'pending',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedByGM" BOOLEAN NOT NULL DEFAULT false,
    "approvedByProductHead" BOOLEAN NOT NULL DEFAULT false,
    "additionalInformation" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,
    "customerType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InvoiceRequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkettingActivity" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "activityName" VARCHAR(50) NOT NULL,
    "activityDate" TEXT NOT NULL,
    "participants" VARCHAR(1000),
    "location" TEXT,
    "objective" TEXT,
    "targetResult" TEXT,
    "briefReport" VARCHAR(1000),
    "costIncurred" VARCHAR(50),
    "pdfDetails" VARCHAR(1000),
    "approved" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "documents" TEXT[],

    CONSTRAINT "MarkettingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTarget" (
    "id" TEXT NOT NULL,
    "month" VARCHAR(50) NOT NULL,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "target" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" TEXT,

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
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "receiverId" TEXT,
    "resourceId" TEXT,
    "resourceUrl" TEXT,
    "message" TEXT NOT NULL,
    "viewed" BOOLEAN DEFAULT false,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "staffCadre" TEXT,
    "title" TEXT NOT NULL DEFAULT 'New Notification',
    "viewedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
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
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceMaster" ADD CONSTRAINT "PriceMaster_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPerson" ADD CONSTRAINT "ContactPerson_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitReport" ADD CONSTRAINT "VisitReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PfiRequestForm" ADD CONSTRAINT "PfiRequestForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES "ContactPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_pfiRequestFormId_fkey" FOREIGN KEY ("pfiRequestFormId") REFERENCES "PfiRequestForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequestForm" ADD CONSTRAINT "InvoiceRequestForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarkettingActivity" ADD CONSTRAINT "MarkettingActivity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTarget" ADD CONSTRAINT "MonthlyTarget_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
