-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('CREATED', 'INVENTORY_PRODUCTS_MISSING', 'INVENTORY_CONFIRMED', 'AWAITING_PAYMENT', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'SHIPMENT_CREATED', 'DELIVERY_FAILED', 'DELIVERY_COMPLETED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('PIX');

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "status" "public"."OrderStatus" NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "total_amount_in_cents" INTEGER,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_products" (
    "quantity" INTEGER NOT NULL,
    "productID" UUID NOT NULL,
    "orderID" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "public"."customers"("id");

-- CreateIndex
CREATE INDEX "customers_id_idx" ON "public"."customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "public"."products"("id");

-- CreateIndex
CREATE INDEX "products_id_idx" ON "public"."products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "public"."orders"("id");

-- CreateIndex
CREATE INDEX "orders_id_idx" ON "public"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_products_id_key" ON "public"."order_products"("id");

-- CreateIndex
CREATE INDEX "order_products_id_idx" ON "public"."order_products"("id");

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_product_product" FOREIGN KEY ("productID") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_product_order" FOREIGN KEY ("orderID") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
