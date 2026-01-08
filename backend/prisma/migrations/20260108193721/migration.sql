/*
  Warnings:

  - You are about to drop the column `assigned_dispatcher_id` on the `request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "request" DROP CONSTRAINT "request_assigned_dispatcher_id_fkey";

-- DropIndex
DROP INDEX "job_request_id_key";

-- DropIndex
DROP INDEX "request_assigned_dispatcher_id_idx";

-- AlterTable
ALTER TABLE "request" DROP COLUMN "assigned_dispatcher_id",
ADD COLUMN     "dispatcherId" TEXT;

-- CreateIndex
CREATE INDEX "quote_request_id_is_active_idx" ON "quote"("request_id", "is_active");

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_dispatcherId_fkey" FOREIGN KEY ("dispatcherId") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
