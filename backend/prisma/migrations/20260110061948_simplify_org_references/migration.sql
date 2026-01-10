/*
  Warnings:

  - You are about to drop the column `organization_id` on the `client_contact` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `client_note` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `job_line_item` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `job_note` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `job_visit` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `job_visit_technician` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `quote` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `quote_line_item` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `quote_note` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `request_note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_contact" DROP CONSTRAINT "client_contact_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_organization_id_fkey";

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
ALTER TABLE "quote" DROP CONSTRAINT "quote_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_line_item" DROP CONSTRAINT "quote_line_item_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_note" DROP CONSTRAINT "quote_note_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "request" DROP CONSTRAINT "request_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "request_note" DROP CONSTRAINT "request_note_organization_id_fkey";

-- DropIndex
DROP INDEX "client_contact_organization_id_idx";

-- DropIndex
DROP INDEX "client_note_organization_id_idx";

-- DropIndex
DROP INDEX "job_organization_id_idx";

-- DropIndex
DROP INDEX "job_line_item_organization_id_idx";

-- DropIndex
DROP INDEX "job_note_organization_id_idx";

-- DropIndex
DROP INDEX "job_visit_organization_id_idx";

-- DropIndex
DROP INDEX "job_visit_technician_organization_id_idx";

-- DropIndex
DROP INDEX "quote_organization_id_idx";

-- DropIndex
DROP INDEX "quote_line_item_organization_id_idx";

-- DropIndex
DROP INDEX "quote_note_organization_id_idx";

-- DropIndex
DROP INDEX "request_organization_id_idx";

-- DropIndex
DROP INDEX "request_note_organization_id_idx";

-- AlterTable
ALTER TABLE "client_contact" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "client_note" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "job" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "job_line_item" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "job_note" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "job_visit" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "job_visit_technician" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "quote" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "quote_line_item" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "quote_note" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "request" DROP COLUMN "organization_id";

-- AlterTable
ALTER TABLE "request_note" DROP COLUMN "organization_id";
