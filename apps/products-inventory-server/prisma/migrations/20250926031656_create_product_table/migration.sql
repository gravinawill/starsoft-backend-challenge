-- CreateTable
CREATE TABLE "public"."products" (
    "name" VARCHAR(255) NOT NULL,
    "price_in_cents" INTEGER NOT NULL,
    "image_url" VARCHAR(255),
    "available_count" INTEGER NOT NULL,
    "unavailable_count" INTEGER NOT NULL,
    "created_by_employee_id" UUID NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_id_key" ON "public"."products"("id");

-- CreateIndex
CREATE INDEX "products_id_idx" ON "public"."products"("id");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_created_by_employee_id_fkey" FOREIGN KEY ("created_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
