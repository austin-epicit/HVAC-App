/*
  Warnings:

  - You are about to drop the column `duration` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_type` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `window_end` on the `job` table. All the data in the column will be lost.
  - You are about to drop the `job_technician` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "schedule_type" AS ENUM ('all_day', 'exact', 'window');

-- CreateEnum
CREATE TYPE "visit_status" AS ENUM ('Scheduled', 'InProgress', 'Completed', 'Cancelled');

-- DropForeignKey
ALTER TABLE "job_technician" DROP CONSTRAINT "job_technician_job_id_fkey";

-- DropForeignKey
ALTER TABLE "job_technician" DROP CONSTRAINT "job_technician_tech_id_fkey";

-- AlterTable
ALTER TABLE "job" DROP COLUMN "duration",
DROP COLUMN "schedule_type",
DROP COLUMN "start_date",
DROP COLUMN "window_end";

-- AlterTable
ALTER TABLE "job_note" ADD COLUMN     "visit_id" TEXT;

-- DropTable
DROP TABLE "job_technician";

-- CreateTable
CREATE TABLE "job_visit" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "schedule_type" "schedule_type" NOT NULL DEFAULT 'exact',
    "scheduled_start_at" TIMESTAMP(3) NOT NULL,
    "scheduled_end_at" TIMESTAMP(3) NOT NULL,
    "arrival_window_start" TIMESTAMP(3),
    "arrival_window_end" TIMESTAMP(3),
    "actual_start_at" TIMESTAMP(3),
    "actual_end_at" TIMESTAMP(3),
    "status" "visit_status" NOT NULL DEFAULT 'Scheduled',

    CONSTRAINT "job_visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_visit_technician" (
    "visit_id" TEXT NOT NULL,
    "tech_id" TEXT NOT NULL,

    CONSTRAINT "job_visit_technician_pkey" PRIMARY KEY ("visit_id","tech_id")
);

-- CreateIndex
CREATE INDEX "job_visit_job_id_idx" ON "job_visit"("job_id");

-- CreateIndex
CREATE INDEX "job_visit_scheduled_start_at_idx" ON "job_visit"("scheduled_start_at");

-- CreateIndex
CREATE INDEX "job_visit_scheduled_end_at_idx" ON "job_visit"("scheduled_end_at");

-- CreateIndex
CREATE INDEX "job_visit_technician_tech_id_idx" ON "job_visit_technician"("tech_id");

-- AddForeignKey
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "job_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_technician" ADD CONSTRAINT "job_visit_technician_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "job_visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_technician" ADD CONSTRAINT "job_visit_technician_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
