-- Migration: Restructure ECHOWORK database for rating platform
-- This migration transforms the database into a comprehensive rating platform for Senegalese companies

-- ============================================================================
-- STEP 1: Create new ENUM types
-- ============================================================================

-- Create ProfileType enum
CREATE TYPE "ProfileType" AS ENUM ('CLIENT', 'EMPLOYEE', 'SUPPLIER', 'OTHER');

-- Create CompanySize enum
CREATE TYPE "CompanySize" AS ENUM ('TPE', 'PME', 'GRANDE');

-- Create ReviewContext enum
CREATE TYPE "ReviewContext" AS ENUM ('CLIENT', 'EMPLOYEE', 'SUPPLIER', 'OTHER');

-- Create ReviewStatus enum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Create SubscriptionPlan enum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- Create AdvertisementType enum
CREATE TYPE "AdvertisementType" AS ENUM ('BANNER', 'SPONSORED');

-- Create AdvertisementStatus enum
CREATE TYPE "AdvertisementStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- Add MODERATOR to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';

-- ============================================================================
-- STEP 2: Modify existing tables - Users Module
-- ============================================================================

-- Add new fields to User table
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- STEP 3: Create UserProfile table
-- ============================================================================

CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT,
    "profileType" "ProfileType" NOT NULL DEFAULT 'CLIENT',
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE INDEX "UserProfile_userId_idx" ON "UserProfile"("userId");
CREATE INDEX "UserProfile_trustScore_idx" ON "UserProfile"("trustScore");

ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 4: Modify Company table
-- ============================================================================

-- Add new fields to Company table
ALTER TABLE "Company" ADD COLUMN "ninea" TEXT;
ALTER TABLE "Company" ADD COLUMN "rccm" TEXT;
ALTER TABLE "Company" ADD COLUMN "size" "CompanySize";
ALTER TABLE "Company" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN "claimedByUserId" INTEGER;

-- Create unique index on ninea
CREATE UNIQUE INDEX "Company_ninea_key" ON "Company"("ninea");

-- Create indexes
CREATE INDEX "Company_ninea_idx" ON "Company"("ninea");
CREATE INDEX "Company_isVerified_idx" ON "Company"("isVerified");
CREATE INDEX "Company_claimedByUserId_idx" ON "Company"("claimedByUserId");

-- Add foreign key constraint for claimed by user
ALTER TABLE "Company" ADD CONSTRAINT "Company_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- STEP 5: Create CompanyLocation table
-- ============================================================================

CREATE TABLE "CompanyLocation" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "region" TEXT,
    "department" TEXT,
    "city" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyLocation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyLocation_companyId_idx" ON "CompanyLocation"("companyId");
CREATE INDEX "CompanyLocation_region_idx" ON "CompanyLocation"("region");
CREATE INDEX "CompanyLocation_city_idx" ON "CompanyLocation"("city");

ALTER TABLE "CompanyLocation" ADD CONSTRAINT "CompanyLocation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing ville/adresse data to CompanyLocation
INSERT INTO "CompanyLocation" ("companyId", "city", "address", "isPrimary", "createdAt", "updatedAt")
SELECT 
    "id", 
    "ville", 
    "adresse", 
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Company"
WHERE "ville" IS NOT NULL OR "adresse" IS NOT NULL;

-- ============================================================================
-- STEP 6: Modify Category table - Add hierarchy support
-- ============================================================================

ALTER TABLE "Category" ADD COLUMN "parentId" INTEGER;

CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- STEP 7: Create CategoryKeyword table
-- ============================================================================

CREATE TABLE "CategoryKeyword" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryKeyword_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CategoryKeyword_categoryId_idx" ON "CategoryKeyword"("categoryId");
CREATE INDEX "CategoryKeyword_keyword_idx" ON "CategoryKeyword"("keyword");

ALTER TABLE "CategoryKeyword" ADD CONSTRAINT "CategoryKeyword_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 8: Modify Review table
-- ============================================================================

ALTER TABLE "Review" ADD COLUMN "context" "ReviewContext" NOT NULL DEFAULT 'CLIENT';
ALTER TABLE "Review" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE INDEX "Review_context_idx" ON "Review"("context");

-- ============================================================================
-- STEP 9: Create RatingCriteria table
-- ============================================================================

CREATE TABLE "RatingCriteria" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatingCriteria_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RatingCriteria_isActive_idx" ON "RatingCriteria"("isActive");

-- ============================================================================
-- STEP 10: Create ReviewScore table
-- ============================================================================

CREATE TABLE "ReviewScore" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReviewScore_reviewId_criteriaId_key" ON "ReviewScore"("reviewId", "criteriaId");
CREATE INDEX "ReviewScore_reviewId_idx" ON "ReviewScore"("reviewId");
CREATE INDEX "ReviewScore_criteriaId_idx" ON "ReviewScore"("criteriaId");
CREATE INDEX "ReviewScore_score_idx" ON "ReviewScore"("score");

ALTER TABLE "ReviewScore" ADD CONSTRAINT "ReviewScore_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewScore" ADD CONSTRAINT "ReviewScore_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "RatingCriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 11: Create CompanyScore table
-- ============================================================================

CREATE TABLE "CompanyScore" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "globalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trustIndex" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompanyScore_companyId_key" ON "CompanyScore"("companyId");
CREATE INDEX "CompanyScore_companyId_idx" ON "CompanyScore"("companyId");
CREATE INDEX "CompanyScore_globalScore_idx" ON "CompanyScore"("globalScore");
CREATE INDEX "CompanyScore_trustIndex_idx" ON "CompanyScore"("trustIndex");

ALTER TABLE "CompanyScore" ADD CONSTRAINT "CompanyScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 12: Create Subscription table
-- ============================================================================

CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");
CREATE INDEX "Subscription_isActive_idx" ON "Subscription"("isActive");
CREATE INDEX "Subscription_endDate_idx" ON "Subscription"("endDate");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- STEP 13: Modify Advertisement table
-- ============================================================================

ALTER TABLE "Advertisement" ADD COLUMN "type" "AdvertisementType" NOT NULL DEFAULT 'BANNER';
ALTER TABLE "Advertisement" ADD COLUMN "status" "AdvertisementStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "Advertisement_status_idx" ON "Advertisement"("status");
CREATE INDEX "Advertisement_type_idx" ON "Advertisement"("type");

-- ============================================================================
-- STEP 14: Insert default rating criteria
-- ============================================================================

INSERT INTO "RatingCriteria" ("name", "description", "weight", "isActive", "createdAt", "updatedAt") VALUES
('Qualité du service', 'Évaluation de la qualité globale du service fourni', 1.5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Prix', 'Rapport qualité-prix des produits ou services', 1.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Transparence', 'Clarté et honnêteté dans les communications et transactions', 1.3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Respect des délais', 'Capacité à respecter les délais convenus', 1.2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Service client', 'Qualité de l''assistance et du support client', 1.4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- STEP 15: Create default subscriptions for existing companies
-- ============================================================================

INSERT INTO "Subscription" ("companyId", "plan", "startDate", "isActive", "createdAt", "updatedAt")
SELECT 
    "id",
    'FREE',
    CURRENT_TIMESTAMP,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Company";

-- ============================================================================
-- STEP 16: Initialize company scores for existing companies
-- ============================================================================

INSERT INTO "CompanyScore" ("companyId", "globalScore", "trustIndex", "totalReviews", "lastUpdated", "createdAt")
SELECT 
    c."id",
    COALESCE(AVG(r."rating")::DOUBLE PRECISION, 0),
    CASE 
        WHEN COUNT(r."id") >= 5 THEN LEAST(COUNT(r."id")::DOUBLE PRECISION / 10.0, 1.0)
        ELSE COUNT(r."id")::DOUBLE PRECISION / 10.0
    END,
    COUNT(r."id")::INTEGER,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Company" c
LEFT JOIN "Review" r ON r."companyId" = c."id"
GROUP BY c."id";
