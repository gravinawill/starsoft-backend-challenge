/*
  Warnings:

  - The primary key for the `order_products_reservations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `order_products_reservations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."order_products_reservations_id_idx";

-- DropIndex
DROP INDEX "public"."order_products_reservations_id_key";

-- AlterTable
ALTER TABLE "public"."order_products_reservations" DROP CONSTRAINT "order_products_reservations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "order_products_reservations_pkey" PRIMARY KEY ("productID", "orderID");
