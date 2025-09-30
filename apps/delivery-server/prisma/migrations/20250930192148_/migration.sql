-- CreateEnum
CREATE TYPE "public"."ShipmentStatus" AS ENUM ('SHIPMENT_CREATED', 'DELIVERY_FAILED', 'DELIVERY_COMPLETED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('CREATED', 'SHIPMENT_CREATED', 'DELIVERY_FAILED', 'DELIVERY_COMPLETED');

-- CreateTable
CREATE TABLE "public"."customers" (
    "name" VARCHAR(255) NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."employees" (
    "name" VARCHAR(255) NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "status" "public"."OrderStatus" NOT NULL,
    "customer_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."shipment_products" (
    "quantity" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "shipment_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "shipment_products_pkey" PRIMARY KEY ("product_id","shipment_id")
);

-- CreateTable
CREATE TABLE "public"."shipments" (
    "status" "public"."ShipmentStatus" NOT NULL,
    "delivered_at" TIMESTAMPTZ,
    "delivered_by_employee_id" UUID,
    "customer_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "public"."customers"("id");

-- CreateIndex
CREATE INDEX "customers_id_idx" ON "public"."customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_id_key" ON "public"."employees"("id");

-- CreateIndex
CREATE INDEX "employees_id_idx" ON "public"."employees"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "public"."orders"("id");

-- CreateIndex
CREATE INDEX "orders_id_idx" ON "public"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "public"."products"("id");

-- CreateIndex
CREATE INDEX "products_id_idx" ON "public"."products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_id_key" ON "public"."shipments"("id");

-- CreateIndex
CREATE INDEX "shipments_id_idx" ON "public"."shipments"("id");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "order_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_products" ADD CONSTRAINT "shipment_product_product" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_products" ADD CONSTRAINT "shipment_product_shipment" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipments" ADD CONSTRAINT "shipment_delivered_by_employee" FOREIGN KEY ("delivered_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipments" ADD CONSTRAINT "shipment_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipments" ADD CONSTRAINT "shipment_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
