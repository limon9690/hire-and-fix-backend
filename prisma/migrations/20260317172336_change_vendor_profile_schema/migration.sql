/*
  Warnings:

  - Made the column `phone` on table `vendor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `vendor_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `vendor_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "vendor_profiles" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;
