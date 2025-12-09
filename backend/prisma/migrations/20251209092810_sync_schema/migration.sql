/*
  Warnings:

  - You are about to drop the column `last_pos` on the `technician` table. All the data in the column will be lost.
  - Added the required column `coords` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coords` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coords` to the `technician` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "coords" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "coords" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "technician" DROP COLUMN "last_pos",
ADD COLUMN     "coords" JSONB NOT NULL;
