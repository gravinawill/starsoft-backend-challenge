-- CreateTable
CREATE TABLE "public"."employees" (
    "name" VARCHAR(255) NOT NULL,
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_id_key" ON "public"."employees"("id");

-- CreateIndex
CREATE INDEX "employees_id_idx" ON "public"."employees"("id");
