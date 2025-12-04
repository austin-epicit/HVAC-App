-- AlterTable
ALTER TABLE "job_note" ADD COLUMN     "dispatcher_id" TEXT,
ADD COLUMN     "tech_id" TEXT;

-- CreateIndex
CREATE INDEX "job_note_tech_id_idx" ON "job_note"("tech_id");

-- CreateIndex
CREATE INDEX "job_note_dispatcher_id_idx" ON "job_note"("dispatcher_id");

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
