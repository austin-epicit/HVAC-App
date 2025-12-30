/*
  Warnings:

  - The primary key for the `client_contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `relation` on the `client_contact` table. All the data in the column will be lost.
  - The `priority` column on the `job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `created_at` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `dispatcher_id` on the `log` table. All the data in the column will be lost.
  - You are about to drop the column `tech_id` on the `log` table. All the data in the column will be lost.
  - You are about to drop the `audit_log` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `dispatcher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `inventory_item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[job_number]` on the table `job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[request_id]` on the table `job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quote_id]` on the table `job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_id` to the `client_contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_number` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actor_type` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_id` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_type` to the `log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type` to the `log` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "request_status" AS ENUM ('New', 'Reviewing', 'NeedsQuote', 'Quoted', 'QuoteApproved', 'QuoteRejected', 'ConvertedToJob', 'Cancelled');

-- CreateEnum
CREATE TYPE "quote_status" AS ENUM ('Draft', 'Sent', 'Viewed', 'Approved', 'Rejected', 'Revised', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "priority" AS ENUM ('Low', 'Medium', 'High', 'Urgent', 'Emergency');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "visit_status" ADD VALUE 'Driving';
ALTER TYPE "visit_status" ADD VALUE 'OnSite';
ALTER TYPE "visit_status" ADD VALUE 'Delayed';

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_actor_dispatcher_id_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_actor_tech_id_fkey";

-- DropForeignKey
ALTER TABLE "client_contact" DROP CONSTRAINT "client_contact_client_id_fkey";

-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_client_id_fkey";

-- DropForeignKey
ALTER TABLE "job_note" DROP CONSTRAINT "job_note_visit_id_fkey";

-- DropForeignKey
ALTER TABLE "job_visit" DROP CONSTRAINT "job_visit_job_id_fkey";

-- DropForeignKey
ALTER TABLE "job_visit_technician" DROP CONSTRAINT "job_visit_technician_visit_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_dispatcher_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_tech_id_fkey";

-- DropIndex
DROP INDEX "client_contact_client_id_idx";

-- DropIndex
DROP INDEX "client_contact_id_key";

-- DropIndex
DROP INDEX "client_note_creator_dispatcher_id_idx";

-- DropIndex
DROP INDEX "client_note_creator_tech_id_idx";

-- DropIndex
DROP INDEX "client_note_last_editor_dispatcher_id_idx";

-- DropIndex
DROP INDEX "client_note_last_editor_tech_id_idx";

-- DropIndex
DROP INDEX "job_note_creator_dispatcher_id_idx";

-- DropIndex
DROP INDEX "job_note_creator_tech_id_idx";

-- DropIndex
DROP INDEX "job_note_last_editor_dispatcher_id_idx";

-- DropIndex
DROP INDEX "job_note_last_editor_tech_id_idx";

-- DropIndex
DROP INDEX "log_dispatcher_id_idx";

-- DropIndex
DROP INDEX "log_id_key";

-- DropIndex
DROP INDEX "log_tech_id_idx";

-- AlterTable
ALTER TABLE "client" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "is_active" SET DEFAULT true,
ALTER COLUMN "last_activity" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "client_contact" DROP CONSTRAINT "client_contact_pkey",
DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "relation",
ADD COLUMN     "contact_id" TEXT NOT NULL,
ADD COLUMN     "is_billing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relationship" TEXT NOT NULL DEFAULT 'contact',
ADD CONSTRAINT "client_contact_pkey" PRIMARY KEY ("client_id", "contact_id");

-- AlterTable
ALTER TABLE "inventory_item" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "unit_price" DECIMAL(10,2),
ALTER COLUMN "quantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "actual_total" DECIMAL(10,2),
ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "estimated_total" DECIMAL(10,2),
ADD COLUMN     "job_number" TEXT NOT NULL,
ADD COLUMN     "quote_id" TEXT,
ADD COLUMN     "request_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "priority",
ADD COLUMN     "priority" "priority" NOT NULL DEFAULT 'Medium',
ALTER COLUMN "status" SET DEFAULT 'Unscheduled';

-- AlterTable
ALTER TABLE "log" DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "dispatcher_id",
DROP COLUMN "tech_id",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "actor_id" TEXT,
ADD COLUMN     "actor_name" TEXT,
ADD COLUMN     "actor_type" TEXT NOT NULL,
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "entity_id" TEXT NOT NULL,
ADD COLUMN     "entity_type" TEXT NOT NULL,
ADD COLUMN     "event_type" TEXT NOT NULL,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "technician" ALTER COLUMN "status" SET DEFAULT 'Offline',
ALTER COLUMN "coords" SET DEFAULT '{}';

-- DropTable
DROP TABLE "audit_log";

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "title" TEXT,
    "type" TEXT,
    "misc_info" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "priority" NOT NULL DEFAULT 'Medium',
    "address" TEXT,
    "coords" JSONB,
    "status" "request_status" NOT NULL DEFAULT 'New',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "assigned_dispatcher_id" TEXT,
    "requires_quote" BOOLEAN NOT NULL DEFAULT false,
    "estimated_value" DECIMAL(10,2),
    "source" TEXT,
    "source_reference" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_note" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_tech_id" TEXT,
    "creator_dispatcher_id" TEXT,
    "last_editor_tech_id" TEXT,
    "last_editor_dispatcher_id" TEXT,

    CONSTRAINT "request_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "request_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "quote_status" NOT NULL DEFAULT 'Draft',
    "address" TEXT NOT NULL,
    "coords" JSONB,
    "priority" "priority" NOT NULL DEFAULT 'Medium',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previous_quote_id" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_by_dispatcher_id" TEXT,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_line_item" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "item_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "quote_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_note" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_tech_id" TEXT,
    "creator_dispatcher_id" TEXT,
    "last_editor_tech_id" TEXT,
    "last_editor_dispatcher_id" TEXT,

    CONSTRAINT "quote_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_line_item" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "source" TEXT NOT NULL,
    "item_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_id_key" ON "contact"("id");

-- CreateIndex
CREATE INDEX "contact_email_idx" ON "contact"("email");

-- CreateIndex
CREATE INDEX "contact_phone_idx" ON "contact"("phone");

-- CreateIndex
CREATE INDEX "contact_is_active_idx" ON "contact"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "contact_email_phone_key" ON "contact"("email", "phone");

-- CreateIndex
CREATE INDEX "request_client_id_idx" ON "request"("client_id");

-- CreateIndex
CREATE INDEX "request_status_idx" ON "request"("status");

-- CreateIndex
CREATE INDEX "request_priority_idx" ON "request"("priority");

-- CreateIndex
CREATE INDEX "request_created_at_idx" ON "request"("created_at");

-- CreateIndex
CREATE INDEX "request_updated_at_idx" ON "request"("updated_at");

-- CreateIndex
CREATE INDEX "request_assigned_dispatcher_id_idx" ON "request"("assigned_dispatcher_id");

-- CreateIndex
CREATE INDEX "request_status_priority_idx" ON "request"("status", "priority");

-- CreateIndex
CREATE INDEX "request_note_request_id_idx" ON "request_note"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "quote_quote_number_key" ON "quote"("quote_number");

-- CreateIndex
CREATE UNIQUE INDEX "quote_previous_quote_id_key" ON "quote"("previous_quote_id");

-- CreateIndex
CREATE INDEX "quote_client_id_idx" ON "quote"("client_id");

-- CreateIndex
CREATE INDEX "quote_request_id_idx" ON "quote"("request_id");

-- CreateIndex
CREATE INDEX "quote_status_idx" ON "quote"("status");

-- CreateIndex
CREATE INDEX "quote_is_active_idx" ON "quote"("is_active");

-- CreateIndex
CREATE INDEX "quote_quote_number_idx" ON "quote"("quote_number");

-- CreateIndex
CREATE INDEX "quote_created_at_idx" ON "quote"("created_at");

-- CreateIndex
CREATE INDEX "quote_client_id_is_active_idx" ON "quote"("client_id", "is_active");

-- CreateIndex
CREATE INDEX "quote_line_item_quote_id_idx" ON "quote_line_item"("quote_id");

-- CreateIndex
CREATE INDEX "quote_line_item_sort_order_idx" ON "quote_line_item"("sort_order");

-- CreateIndex
CREATE INDEX "quote_note_quote_id_idx" ON "quote_note"("quote_id");

-- CreateIndex
CREATE INDEX "job_line_item_job_id_idx" ON "job_line_item"("job_id");

-- CreateIndex
CREATE INDEX "client_is_active_idx" ON "client"("is_active");

-- CreateIndex
CREATE INDEX "client_created_at_idx" ON "client"("created_at");

-- CreateIndex
CREATE INDEX "client_contact_contact_id_idx" ON "client_contact"("contact_id");

-- CreateIndex
CREATE INDEX "client_note_created_at_idx" ON "client_note"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "dispatcher_email_key" ON "dispatcher"("email");

-- CreateIndex
CREATE INDEX "dispatcher_email_idx" ON "dispatcher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_sku_key" ON "inventory_item"("sku");

-- CreateIndex
CREATE INDEX "inventory_item_sku_idx" ON "inventory_item"("sku");

-- CreateIndex
CREATE INDEX "inventory_item_is_active_idx" ON "inventory_item"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "job_job_number_key" ON "job"("job_number");

-- CreateIndex
CREATE UNIQUE INDEX "job_request_id_key" ON "job"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_quote_id_key" ON "job"("quote_id");

-- CreateIndex
CREATE INDEX "job_status_idx" ON "job"("status");

-- CreateIndex
CREATE INDEX "job_priority_idx" ON "job"("priority");

-- CreateIndex
CREATE INDEX "job_created_at_idx" ON "job"("created_at");

-- CreateIndex
CREATE INDEX "job_updated_at_idx" ON "job"("updated_at");

-- CreateIndex
CREATE INDEX "job_request_id_idx" ON "job"("request_id");

-- CreateIndex
CREATE INDEX "job_quote_id_idx" ON "job"("quote_id");

-- CreateIndex
CREATE INDEX "job_client_id_status_idx" ON "job"("client_id", "status");

-- CreateIndex
CREATE INDEX "job_note_visit_id_idx" ON "job_note"("visit_id");

-- CreateIndex
CREATE INDEX "job_visit_status_idx" ON "job_visit"("status");

-- CreateIndex
CREATE INDEX "job_visit_technician_visit_id_idx" ON "job_visit_technician"("visit_id");

-- CreateIndex
CREATE INDEX "log_entity_type_entity_id_idx" ON "log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "log_event_type_idx" ON "log"("event_type");

-- CreateIndex
CREATE INDEX "log_action_idx" ON "log"("action");

-- CreateIndex
CREATE INDEX "log_timestamp_idx" ON "log"("timestamp");

-- CreateIndex
CREATE INDEX "log_actor_type_actor_id_idx" ON "log"("actor_type", "actor_id");

-- CreateIndex
CREATE INDEX "log_actor_type_idx" ON "log"("actor_type");

-- CreateIndex
CREATE INDEX "technician_email_idx" ON "technician"("email");

-- CreateIndex
CREATE INDEX "technician_status_idx" ON "technician"("status");

-- AddForeignKey
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_assigned_dispatcher_id_fkey" FOREIGN KEY ("assigned_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_creator_tech_id_fkey" FOREIGN KEY ("creator_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_creator_dispatcher_id_fkey" FOREIGN KEY ("creator_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_last_editor_tech_id_fkey" FOREIGN KEY ("last_editor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_last_editor_dispatcher_id_fkey" FOREIGN KEY ("last_editor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_previous_quote_id_fkey" FOREIGN KEY ("previous_quote_id") REFERENCES "quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_created_by_dispatcher_id_fkey" FOREIGN KEY ("created_by_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_item" ADD CONSTRAINT "quote_line_item_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_creator_tech_id_fkey" FOREIGN KEY ("creator_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_creator_dispatcher_id_fkey" FOREIGN KEY ("creator_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_last_editor_tech_id_fkey" FOREIGN KEY ("last_editor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_last_editor_dispatcher_id_fkey" FOREIGN KEY ("last_editor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_line_item" ADD CONSTRAINT "job_line_item_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit" ADD CONSTRAINT "job_visit_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_technician" ADD CONSTRAINT "job_visit_technician_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "job_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "job_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
