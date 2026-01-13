-- CreateEnum
CREATE TYPE "discount_type" AS ENUM ('percent', 'amount');

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "discount_amount" DECIMAL(10,2),
ADD COLUMN     "discount_type" "discount_type",
ADD COLUMN     "discount_value" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "quote" ADD COLUMN     "discount_type" "discount_type",
ADD COLUMN     "discount_value" DECIMAL(10,2),
ALTER COLUMN "discount_amount" DROP NOT NULL,
ALTER COLUMN "discount_amount" DROP DEFAULT;
