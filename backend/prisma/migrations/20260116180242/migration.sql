/*
  Warnings:

  - The `item_type` column on the `job_line_item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `item_type` column on the `quote_line_item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `dispatcherId` on the `request` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organization_id,email]` on the table `contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organization_id,phone]` on the table `contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[recurring_plan_id]` on the table `job` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `source` on the `job_line_item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "line_item_type" AS ENUM ('labor', 'material', 'equipment', 'other');

-- CreateEnum
CREATE TYPE "line_item_source" AS ENUM ('quote', 'recurring_plan', 'manual', 'field_addition');

-- CreateEnum
CREATE TYPE "recurring_plan_status" AS ENUM ('Active', 'Paused', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "billing_mode" AS ENUM ('per_visit', 'subscription', 'none');

-- CreateEnum
CREATE TYPE "invoice_timing" AS ENUM ('on_completion', 'on_schedule_date', 'manual');

-- CreateEnum
CREATE TYPE "occurrence_status" AS ENUM ('planned', 'generated', 'skipped', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "recurring_frequency" AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- CreateEnum
CREATE TYPE "weekday" AS ENUM ('MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU');

-- DropForeignKey
ALTER TABLE "request" DROP CONSTRAINT "request_dispatcherId_fkey";

-- DropIndex
DROP INDEX "contact_email_phone_key";

-- AlterTable
ALTER TABLE "client_note" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "recurring_plan_id" TEXT;

-- AlterTable
ALTER TABLE "job_line_item" DROP COLUMN "source",
ADD COLUMN     "source" "line_item_source" NOT NULL,
DROP COLUMN "item_type",
ADD COLUMN     "item_type" "line_item_type";

-- AlterTable
ALTER TABLE "job_note" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "job_visit" ADD COLUMN     "discount_amount" DECIMAL(10,2),
ADD COLUMN     "discount_type" "discount_type",
ADD COLUMN     "discount_value" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "quote_line_item" DROP COLUMN "item_type",
ADD COLUMN     "item_type" "line_item_type";

-- AlterTable
ALTER TABLE "quote_note" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "request" DROP COLUMN "dispatcherId",
ADD COLUMN     "created_by_dispatcher_id" TEXT,
ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "request_note" ADD COLUMN     "organization_id" TEXT;

-- CreateTable
CREATE TABLE "job_visit_line_item" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "source" "line_item_source" NOT NULL,
    "item_type" "line_item_type",
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_visit_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_plan" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "coords" JSONB,
    "priority" "priority" NOT NULL DEFAULT 'Medium',
    "status" "recurring_plan_status" NOT NULL DEFAULT 'Active',
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "generation_window_days" INTEGER NOT NULL DEFAULT 90,
    "min_advance_days" INTEGER NOT NULL DEFAULT 14,
    "billing_mode" "billing_mode" NOT NULL DEFAULT 'per_visit',
    "invoice_timing" "invoice_timing" NOT NULL DEFAULT 'on_completion',
    "auto_invoice" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_dispatcher_id" TEXT,

    CONSTRAINT "recurring_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_rule" (
    "id" TEXT NOT NULL,
    "recurring_plan_id" TEXT NOT NULL,
    "frequency" "recurring_frequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "by_month_day" INTEGER,
    "by_month" INTEGER,
    "time_of_day" TEXT,
    "schedule_type" "schedule_type" NOT NULL DEFAULT 'exact',
    "duration_minutes" INTEGER NOT NULL DEFAULT 120,
    "arrival_window_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_rule_weekday" (
    "id" TEXT NOT NULL,
    "recurring_rule_id" TEXT NOT NULL,
    "weekday" "weekday" NOT NULL,

    CONSTRAINT "recurring_rule_weekday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_occurrence" (
    "id" TEXT NOT NULL,
    "recurring_plan_id" TEXT NOT NULL,
    "occurrence_start_at" TIMESTAMP(3) NOT NULL,
    "occurrence_end_at" TIMESTAMP(3) NOT NULL,
    "status" "occurrence_status" NOT NULL DEFAULT 'planned',
    "job_visit_id" TEXT,
    "generated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "skipped_at" TIMESTAMP(3),
    "skip_reason" TEXT,
    "template_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_occurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_plan_line_item" (
    "id" TEXT NOT NULL,
    "recurring_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "item_type" "line_item_type",
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_plan_line_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_plan_note" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "recurring_plan_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creator_tech_id" TEXT,
    "creator_dispatcher_id" TEXT,
    "last_editor_tech_id" TEXT,
    "last_editor_dispatcher_id" TEXT,

    CONSTRAINT "recurring_plan_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_visit_line_item_visit_id_idx" ON "job_visit_line_item"("visit_id");

-- CreateIndex
CREATE INDEX "job_visit_line_item_sort_order_idx" ON "job_visit_line_item"("sort_order");

-- CreateIndex
CREATE INDEX "recurring_plan_client_id_idx" ON "recurring_plan"("client_id");

-- CreateIndex
CREATE INDEX "recurring_plan_status_idx" ON "recurring_plan"("status");

-- CreateIndex
CREATE INDEX "recurring_plan_organization_id_idx" ON "recurring_plan"("organization_id");

-- CreateIndex
CREATE INDEX "recurring_plan_starts_at_idx" ON "recurring_plan"("starts_at");

-- CreateIndex
CREATE INDEX "recurring_plan_client_id_status_idx" ON "recurring_plan"("client_id", "status");

-- CreateIndex
CREATE INDEX "recurring_rule_recurring_plan_id_idx" ON "recurring_rule"("recurring_plan_id");

-- CreateIndex
CREATE INDEX "recurring_rule_weekday_weekday_idx" ON "recurring_rule_weekday"("weekday");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_rule_weekday_recurring_rule_id_weekday_key" ON "recurring_rule_weekday"("recurring_rule_id", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_occurrence_job_visit_id_key" ON "recurring_occurrence"("job_visit_id");

-- CreateIndex
CREATE INDEX "recurring_occurrence_recurring_plan_id_idx" ON "recurring_occurrence"("recurring_plan_id");

-- CreateIndex
CREATE INDEX "recurring_occurrence_occurrence_start_at_idx" ON "recurring_occurrence"("occurrence_start_at");

-- CreateIndex
CREATE INDEX "recurring_occurrence_status_idx" ON "recurring_occurrence"("status");

-- CreateIndex
CREATE INDEX "recurring_occurrence_job_visit_id_idx" ON "recurring_occurrence"("job_visit_id");

-- CreateIndex
CREATE UNIQUE INDEX "recurring_occurrence_recurring_plan_id_occurrence_start_at_key" ON "recurring_occurrence"("recurring_plan_id", "occurrence_start_at");

-- CreateIndex
CREATE INDEX "recurring_plan_line_item_recurring_plan_id_idx" ON "recurring_plan_line_item"("recurring_plan_id");

-- CreateIndex
CREATE INDEX "recurring_plan_line_item_sort_order_idx" ON "recurring_plan_line_item"("sort_order");

-- CreateIndex
CREATE INDEX "recurring_plan_note_recurring_plan_id_idx" ON "recurring_plan_note"("recurring_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_organization_id_email_key" ON "contact"("organization_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contact_organization_id_phone_key" ON "contact"("organization_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "job_recurring_plan_id_key" ON "job"("recurring_plan_id");

-- CreateIndex
CREATE INDEX "job_recurring_plan_id_idx" ON "job"("recurring_plan_id");

-- CreateIndex
CREATE INDEX "job_visit_job_id_scheduled_start_at_idx" ON "job_visit"("job_id", "scheduled_start_at");

-- CreateIndex
CREATE INDEX "request_created_by_dispatcher_id_idx" ON "request"("created_by_dispatcher_id");

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_created_by_dispatcher_id_fkey" FOREIGN KEY ("created_by_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_note" ADD CONSTRAINT "request_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_note" ADD CONSTRAINT "quote_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "recurring_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_visit_line_item" ADD CONSTRAINT "job_visit_line_item_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "job_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan" ADD CONSTRAINT "recurring_plan_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan" ADD CONSTRAINT "recurring_plan_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan" ADD CONSTRAINT "recurring_plan_created_by_dispatcher_id_fkey" FOREIGN KEY ("created_by_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rule" ADD CONSTRAINT "recurring_rule_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "recurring_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_rule_weekday" ADD CONSTRAINT "recurring_rule_weekday_recurring_rule_id_fkey" FOREIGN KEY ("recurring_rule_id") REFERENCES "recurring_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_occurrence" ADD CONSTRAINT "recurring_occurrence_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "recurring_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_occurrence" ADD CONSTRAINT "recurring_occurrence_job_visit_id_fkey" FOREIGN KEY ("job_visit_id") REFERENCES "job_visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_line_item" ADD CONSTRAINT "recurring_plan_line_item_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "recurring_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_recurring_plan_id_fkey" FOREIGN KEY ("recurring_plan_id") REFERENCES "recurring_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_creator_tech_id_fkey" FOREIGN KEY ("creator_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_creator_dispatcher_id_fkey" FOREIGN KEY ("creator_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_last_editor_tech_id_fkey" FOREIGN KEY ("last_editor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_plan_note" ADD CONSTRAINT "recurring_plan_note_last_editor_dispatcher_id_fkey" FOREIGN KEY ("last_editor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
