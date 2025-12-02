-- CreateTable
CREATE TABLE "job_note" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_note_job_id_idx" ON "job_note"("job_id");

-- AddForeignKey
ALTER TABLE "job_note" ADD CONSTRAINT "job_note_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
