import { type MigrationInterface, type QueryRunner } from 'typeorm'

export class UpdatePostTable1759119922960 implements MigrationInterface {
  name = 'UpdatePostTable1759119922960'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(255) NOT NULL, "customer_id" uuid NOT NULL, "total_amount_in_cents" integer, "payment_method" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "order_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_3e59f094c2dc3310d585216a813" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "createdAt"`)
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "deletedAt"`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "deleted_at" TIMESTAMP DEFAULT now()`)
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "order_products" ADD CONSTRAINT "FK_f258ce2f670b34b38630914cf9e" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "order_products" ADD CONSTRAINT "FK_2d58e8bd11dc840b39f99824d84" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_products" DROP CONSTRAINT "FK_2d58e8bd11dc840b39f99824d84"`)
    await queryRunner.query(`ALTER TABLE "order_products" DROP CONSTRAINT "FK_f258ce2f670b34b38630914cf9e"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`)
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "deleted_at"`)
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "updated_at"`)
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "created_at"`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "deletedAt" TIMESTAMP DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "customers" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`DROP TABLE "products"`)
    await queryRunner.query(`DROP TABLE "order_products"`)
    await queryRunner.query(`DROP TABLE "orders"`)
  }
}
