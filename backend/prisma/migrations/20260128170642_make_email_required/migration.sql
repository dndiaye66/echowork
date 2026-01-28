-- AlterTable: Make email field required and unique
-- This migration will fail if there are existing users with NULL emails or duplicate emails
-- You should update existing data before running this migration

-- First, update any NULL emails to temporary unique values (optional, if needed)
-- UPDATE "User" SET email = CONCAT('temp_', id, '@changeme.local') WHERE email IS NULL;

-- Make email field required and add unique constraint
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- Create unique index on email (also serves for faster lookups)
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
