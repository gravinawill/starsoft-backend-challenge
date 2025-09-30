-- CreateEnum
CREATE TYPE "public"."OrderProductReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_products_reservations" (
    "quantity" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ,
    "status" "public"."OrderProductReservationStatus" NOT NULL,
    "productID" UUID NOT NULL,
    "orderID" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "order_products_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "public"."orders"("id");

-- CreateIndex
CREATE INDEX "orders_id_idx" ON "public"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_products_reservations_id_key" ON "public"."order_products_reservations"("id");

-- CreateIndex
CREATE INDEX "order_products_reservations_id_idx" ON "public"."order_products_reservations"("id");

-- AddForeignKey
ALTER TABLE "public"."order_products_reservations" ADD CONSTRAINT "order_product_reservation_product" FOREIGN KEY ("productID") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products_reservations" ADD CONSTRAINT "order_product_reservation_order" FOREIGN KEY ("orderID") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
