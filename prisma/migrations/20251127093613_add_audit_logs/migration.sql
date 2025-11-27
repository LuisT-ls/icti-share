-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
  'MATERIAL_UPLOAD',
  'MATERIAL_DELETE',
  'MATERIAL_APPROVE',
  'MATERIAL_REJECT',
  'MATERIAL_UPDATE',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'USER_ROLE_CHANGE',
  'COMMENT_CREATE',
  'COMMENT_DELETE',
  'COMMENT_MODERATE',
  'RATING_CREATE',
  'RATING_UPDATE',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_RESET',
  'ADMIN_ACTION'
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

