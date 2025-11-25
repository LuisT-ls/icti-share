-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "materials" ADD COLUMN "status" "MaterialStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "materials_status_idx" ON "materials"("status");

