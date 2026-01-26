/*
  Warnings:

  - You are about to drop the column `schedule_type` on the `job_visit` table. All the data in the column will be lost.
  - You are about to drop the column `arrival_window_minutes` on the `recurring_rule` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `recurring_rule` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_type` on the `recurring_rule` table. All the data in the column will be lost.
  - You are about to drop the column `time_of_day` on the `recurring_rule` table. All the data in the column will be lost.
  - Added the required column `arrival_constraint` to the `job_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finish_constraint` to the `job_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `job_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrival_constraint` to the `recurring_rule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finish_constraint` to the `recurring_rule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "arrival_constraint" AS ENUM ('anytime', 'at', 'between', 'by');

-- CreateEnum
CREATE TYPE "finish_constraint" AS ENUM ('when_done', 'at', 'by');

-- AlterTable
ALTER TABLE "job_visit" DROP COLUMN "schedule_type",
ADD COLUMN     "arrival_constraint" "arrival_constraint" NOT NULL,
ADD COLUMN     "arrival_time" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "finish_constraint" "finish_constraint" NOT NULL,
ADD COLUMN     "finish_time" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "arrival_window_start" SET DATA TYPE TEXT,
ALTER COLUMN "arrival_window_end" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "recurring_rule" DROP COLUMN "arrival_window_minutes",
DROP COLUMN "duration_minutes",
DROP COLUMN "schedule_type",
DROP COLUMN "time_of_day",
ADD COLUMN     "arrival_constraint" "arrival_constraint" NOT NULL,
ADD COLUMN     "arrival_time" TEXT,
ADD COLUMN     "arrival_window_end" TEXT,
ADD COLUMN     "arrival_window_start" TEXT,
ADD COLUMN     "finish_constraint" "finish_constraint" NOT NULL,
ADD COLUMN     "finish_time" TEXT;

-- DropEnum
DROP TYPE "schedule_type";
