/*
  Warnings:

  - Added the required column `payment_gateway` to the `billings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_gateway_billing_id` to the `billings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentGateway" AS ENUM ('ABACATE_PAY');

-- AlterTable
ALTER TABLE "public"."billings" ADD COLUMN     "payment_gateway" "public"."PaymentGateway" NOT NULL,
ADD COLUMN     "payment_gateway_billing_id" UUID NOT NULL;
