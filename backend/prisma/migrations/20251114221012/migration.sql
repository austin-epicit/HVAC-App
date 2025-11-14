/*
  Warnings:

  - You are about to drop the column `starts_at` on the `job` table. All the data in the column will be lost.
  - Added the required column `start_date` to the `job` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "job" RENAME COLUMN "starts_at" TO "start_date";
