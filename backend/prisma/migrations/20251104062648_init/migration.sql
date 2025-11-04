-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('Unscheduled', 'Scheduled', 'InProgress', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "technician_status" AS ENUM ('Offline', 'Available', 'Busy', 'Break');

-- CreateTable
CREATE TABLE "job" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "job_status" NOT NULL,
    "time_mins" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "technician_status" NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "last_pos" point NOT NULL,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_technician" (
    "job_id" TEXT NOT NULL,
    "tech_id" TEXT NOT NULL,

    CONSTRAINT "job_technician_pkey" PRIMARY KEY ("job_id","tech_id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_contact" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "client_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_note" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "tech_id" TEXT,
    "operator_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT,
    "tech_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_id_key" ON "job"("id");

-- CreateIndex
CREATE INDEX "job_client_id_idx" ON "job"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "technician_id_key" ON "technician"("id");

-- CreateIndex
CREATE UNIQUE INDEX "technician_email_key" ON "technician"("email");

-- CreateIndex
CREATE INDEX "job_technician_tech_id_idx" ON "job_technician"("tech_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_id_key" ON "client"("id");

-- CreateIndex
CREATE UNIQUE INDEX "client_contact_id_key" ON "client_contact"("id");

-- CreateIndex
CREATE INDEX "client_contact_client_id_idx" ON "client_contact"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "client_note_id_key" ON "client_note"("id");

-- CreateIndex
CREATE INDEX "client_note_client_id_idx" ON "client_note"("client_id");

-- CreateIndex
CREATE INDEX "client_note_tech_id_idx" ON "client_note"("tech_id");

-- CreateIndex
CREATE INDEX "client_note_operator_id_idx" ON "client_note"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "operator_id_key" ON "operator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "log_id_key" ON "log"("id");

-- CreateIndex
CREATE INDEX "log_operator_id_idx" ON "log"("operator_id");

-- CreateIndex
CREATE INDEX "log_tech_id_idx" ON "log"("tech_id");

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_technician" ADD CONSTRAINT "job_technician_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_technician" ADD CONSTRAINT "job_technician_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contact" ADD CONSTRAINT "client_contact_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
