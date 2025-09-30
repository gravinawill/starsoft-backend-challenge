/*
  Warnings:

  - Added the required column `price_per_unit_in_cents` to the `order_products_reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."order_products_reservations" ADD COLUMN     "price_per_unit_in_cents" INTEGER NOT NULL;
