/*
  Warnings:

  - Added the required column `organization_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `client_contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `client_note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `dispatcher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `inventory_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `job_line_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `job_note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `job_visit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `job_visit_technician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `quote_line_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `quote_note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `request_note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `technician` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "client_contact" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "client_note" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "contact" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dispatcher" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory_item" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_line_item" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_note" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_visit" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "job_visit_technician" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "log" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quote_line_item" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quote_note" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "request" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "request_note" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "technician" ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_organization_id_idx" ON "client"("organization_id");

-- CreateIndex
CREATE INDEX "client_contact_organization_id_idx" ON "client_contact"("organization_id");

-- CreateIndex
CREATE INDEX "client_note_organization_id_idx" ON "client_note"("organization_id");

-- CreateIndex
CREATE INDEX "contact_organization_id_idx" ON "contact"("organization_id");

-- CreateIndex
CREATE INDEX "dispatcher_organization_id_idx" ON "dispatcher"("organization_id");

-- CreateIndex
CREATE INDEX "inventory_item_organization_id_idx" ON "inventory_item"("organization_id");

-- CreateIndex
CREATE INDEX "job_organization_id_idx" ON "job"("organization_id");

-- CreateIndex
CREATE INDEX "job_line_item_organization_id_idx" ON "job_line_item"("organization_id");

-- CreateIndex
CREATE INDEX "job_note_organization_id_idx" ON "job_note"("organization_id");

-- CreateIndex
CREATE INDEX "job_visit_organization_id_idx" ON "job_visit"("organization_id");

-- CreateIndex
CREATE INDEX "job_visit_technician_organization_id_idx" ON "job_visit_technician"("organization_id");

-- CreateIndex
CREATE INDEX "log_organization_id_idx" ON "log"("organization_id");

-- CreateIndex
CREATE INDEX "quote_organization_id_idx" ON "quote"("organization_id");

-- CreateIndex
CREATE INDEX "quote_line_item_organization_id_idx" ON "quote_line_item"("organization_id");

-- CreateIndex
CREATE INDEX "quote_note_organization_id_idx" ON "quote_note"("organization_id");

-- CreateIndex
CREATE INDEX "request_organization_id_idx" ON "request"("organization_id");

-- CreateIndex
CREATE INDEX "request_note_organization_id_idx" ON "request_note"("organization_id");

-- CreateIndex
CREATE INDEX "technician_organization_id_idx" ON "technician"("organization_id");

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_line_item" ADD CONSTRAINT "job_line_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_technician" ADD CONSTRAINT "job_visit_technician_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician" ADD CONSTRAINT "technician_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatcher" ADD CONSTRAINT "dispatcher_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
