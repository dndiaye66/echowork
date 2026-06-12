-- AlterTable: add coverImageUrl and parentCompanyId to Company
ALTER TABLE "Company" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "Company" ADD COLUMN "parentCompanyId" INTEGER;

-- AddForeignKey: branches self-reference
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentCompanyId_fkey"
  FOREIGN KEY ("parentCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Company_parentCompanyId_idx" ON "Company"("parentCompanyId");
