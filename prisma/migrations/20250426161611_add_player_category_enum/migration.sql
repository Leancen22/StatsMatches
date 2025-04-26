-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MASCULINO', 'FEMENINO');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'MASCULINO';
