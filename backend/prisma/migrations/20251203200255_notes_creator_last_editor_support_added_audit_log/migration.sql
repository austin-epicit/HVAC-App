/*
  Warnings:

  - You are about to drop the column `dispatcher_id` on the `client_note` table. All the data in the column will be lost.
  - You are about to drop the column `tech_id` on the `client_note` table. All the data in the column will be lost.
  - You are about to drop the column `dispatcher_id` on the `job_note` table. All the data in the column will be lost.
  - You are about to drop the column `tech_id` on the `job_note` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_dispatcher_id_fkey";

-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_tech_id_fkey";

-- DropForeignKey
ALTER TABLE "job_note" DROP CONSTRAINT "job_note_dispatcher_id_fkey";

-- DropForeignKey
ALTER TABLE "job_note" DROP CONSTRAINT "job_note_tech_id_fkey";

-- DropIndex
DROP INDEX "client_note_dispatcher_id_idx";

-- DropIndex
DROP INDEX "client_note_tech_id_idx";

-- DropIndex
DROP INDEX "job_note_dispatcher_id_idx";

-- DropIndex
DROP INDEX "job_note_tech_id_idx";

-- AlterTable
ALTER TABLE "client_note" DROP COLUMN "dispatcher_id",
DROP COLUMN "tech_id",
ADD COLUMN     "creator_dispatcher_id" TEXT,
ADD COLUMN     "creator_tech_id" TEXT,
ADD COLUMN     "last_editor_dispatcher_id" TEXT,
ADD COLUMN     "last_editor_tech_id" TEXT;

-- AlterTable
ALTER TABLE "job_note" DROP COLUMN "dispatcher_id",
DROP COLUMN "tech_id",
ADD COLUMN     "creator_dispatcher_id" TEXT,
ADD COLUMN     "creator_tech_id" TEXT,
ADD COLUMN     "last_editor_dispatcher_id" TEXT,
ADD COLUMN     "last_editor_tech_id" TEXT;

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_tech_id" TEXT,
    "actor_dispatcher_id" TEXT,
    "changes" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reason" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_timestamp_idx" ON "audit_log"("timestamp");

-- CreateIndex
CREATE INDEX "audit_log_actor_tech_id_idx" ON "audit_log"("actor_tech_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_dispatcher_id_idx" ON "audit_log"("actor_dispatcher_id");

-- CreateIndex
CREATE INDEX "client_note_creator_tech_id_idx" ON "client_note"("creator_tech_id");

-- CreateIndex
CREATE INDEX "client_note_creator_dispatcher_id_idx" ON "client_note"("creator_dispatcher_id");

-- CreateIndex
CREATE INDEX "client_note_last_editor_tech_id_idx" ON "client_note"("last_editor_tech_id");

-- CreateIndex
CREATE INDEX "client_note_last_editor_dispatcher_id_idx" ON "client_note"("last_editor_dispatcher_id");

-- CreateIndex
CREATE INDEX "job_note_creator_tech_id_idx" ON "job_note"("creator_tech_id");

-- CreateIndex
CREATE INDEX "job_note_creator_dispatcher_id_idx" ON "job_note"("creator_dispatcher_id");

-- CreateIndex
CREATE INDEX "job_note_last_editor_tech_id_idx" ON "job_note"("last_editor_tech_id");

-- CreateIndex
CREATE INDEX "job_note_last_editor_dispatcher_id_idx" ON "job_note"("last_editor_dispatcher_id");

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_creator_tech_id_fkey" FOREIGN KEY ("creator_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_creator_dispatcher_id_fkey" FOREIGN KEY ("creator_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_last_editor_tech_id_fkey" FOREIGN KEY ("last_editor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_last_editor_dispatcher_id_fkey" FOREIGN KEY ("last_editor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_creator_tech_id_fkey" FOREIGN KEY ("creator_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_creator_dispatcher_id_fkey" FOREIGN KEY ("creator_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_last_editor_tech_id_fkey" FOREIGN KEY ("last_editor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_last_editor_dispatcher_id_fkey" FOREIGN KEY ("last_editor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_tech_id_fkey" FOREIGN KEY ("actor_tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_dispatcher_id_fkey" FOREIGN KEY ("actor_dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
