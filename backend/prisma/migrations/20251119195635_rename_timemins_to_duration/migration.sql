/*
  Warnings:

  - You are about to drop the column `time_mins` on the `job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job" DROP COLUMN "time_mins",
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "schedule_type" TEXT NOT NULL DEFAULT 'exact',
ADD COLUMN     "window_end" TIMESTAMP(3);
