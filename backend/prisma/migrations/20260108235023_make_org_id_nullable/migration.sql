-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "client_contact" DROP CONSTRAINT "client_contact_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "contact" DROP CONSTRAINT "contact_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "dispatcher" DROP CONSTRAINT "dispatcher_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_item" DROP CONSTRAINT "inventory_item_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "job_line_item" DROP CONSTRAINT "job_line_item_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "job_note" DROP CONSTRAINT "job_note_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "job_visit" DROP CONSTRAINT "job_visit_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "job_visit_technician" DROP CONSTRAINT "job_visit_technician_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quote" DROP CONSTRAINT "quote_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_line_item" DROP CONSTRAINT "quote_line_item_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_note" DROP CONSTRAINT "quote_note_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "request" DROP CONSTRAINT "request_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "request_note" DROP CONSTRAINT "request_note_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "technician" DROP CONSTRAINT "technician_organization_id_fkey";

-- AlterTable
ALTER TABLE "client" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "client_contact" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "client_note" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contact" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "dispatcher" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "inventory_item" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job_line_item" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job_note" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job_visit" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "job_visit_technician" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "log" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quote" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quote_line_item" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "quote_note" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "request" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "request_note" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "technician" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "contact" ADD CONSTRAINT "contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_line_item" ADD CONSTRAINT "job_line_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_technician" ADD CONSTRAINT "job_visit_technician_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_item" ADD CONSTRAINT "inventory_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician" ADD CONSTRAINT "technician_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatcher" ADD CONSTRAINT "dispatcher_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
