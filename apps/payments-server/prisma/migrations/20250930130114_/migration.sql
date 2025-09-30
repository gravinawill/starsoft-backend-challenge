-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('CREATED', 'AWAITING_PAYMENT', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('PIX');

-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('PENDING', 'EXPIRED', 'CANCELLED', 'PAID', 'REFUNDED');

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
CREATE TABLE "public"."orders" (
    "status" "public"."OrderStatus" NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "total_amount_in_cents" INTEGER,
    "customer_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billings" (
    "status" "public"."BillingStatus" NOT NULL,
    "payment_url" TEXT,
    "amount_in_cents" INTEGER NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "order_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "billings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_key" ON "public"."customers"("id");

-- CreateIndex
CREATE INDEX "customers_id_idx" ON "public"."customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_id_key" ON "public"."orders"("id");

-- CreateIndex
CREATE INDEX "orders_id_idx" ON "public"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "billings_id_key" ON "public"."billings"("id");

-- CreateIndex
CREATE INDEX "billings_id_idx" ON "public"."billings"("id");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "order_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billings" ADD CONSTRAINT "billing_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billings" ADD CONSTRAINT "billing_customer" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
