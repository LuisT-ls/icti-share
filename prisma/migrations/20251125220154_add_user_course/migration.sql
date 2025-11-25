-- AlterTable
ALTER TABLE "users" ADD COLUMN     "course" TEXT;

-- CreateIndex
CREATE INDEX "users_course_idx" ON "users"("course");
