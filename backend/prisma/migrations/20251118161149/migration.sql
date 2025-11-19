/*
  Warnings:

  - You are about to drop the column `operator_id` on the `client_note` table. All the data in the column will be lost.
  - You are about to drop the column `operator_id` on the `log` table. All the data in the column will be lost.
  - You are about to drop the `operator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_note" DROP CONSTRAINT "client_note_operator_id_fkey";

-- DropForeignKey
ALTER TABLE "log" DROP CONSTRAINT "log_operator_id_fkey";

-- DropIndex
DROP INDEX "client_note_operator_id_idx";

-- DropIndex
DROP INDEX "log_operator_id_idx";

-- AlterTable
ALTER TABLE "client_note" DROP COLUMN "operator_id",
ADD COLUMN     "dispatcher_id" TEXT;

-- AlterTable
ALTER TABLE "log" DROP COLUMN "operator_id",
ADD COLUMN     "dispatcher_id" TEXT;

-- DropTable
DROP TABLE "operator";

-- CreateTable
CREATE TABLE "inventory_item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatcher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatcher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_id_key" ON "inventory_item"("id");

-- CreateIndex
CREATE UNIQUE INDEX "dispatcher_id_key" ON "dispatcher"("id");

-- CreateIndex
CREATE INDEX "client_note_dispatcher_id_idx" ON "client_note"("dispatcher_id");

-- CreateIndex
CREATE INDEX "log_dispatcher_id_idx" ON "log"("dispatcher_id");

-- AddForeignKey
ALTER TABLE "client_note" ADD CONSTRAINT "client_note_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "dispatcher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
