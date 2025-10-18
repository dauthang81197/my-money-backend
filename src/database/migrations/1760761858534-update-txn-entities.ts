import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTxnEntities1760761858534 implements MigrationInterface {
  name = 'UpdateTxnEntities1760761858534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "txn_split" DROP CONSTRAINT "FK_4fd889214101aa7c0b226c8046c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4fd889214101aa7c0b226c8046"`,
    );
    await queryRunner.query(
      `ALTER TABLE "txn_split" RENAME COLUMN "txnId" TO "txn_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb315c3e8cca65a87d039171b1" ON "txn_split" ("txn_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "txn_split" ADD CONSTRAINT "FK_fb315c3e8cca65a87d039171b16" FOREIGN KEY ("txn_id") REFERENCES "txn"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "txn_split" DROP CONSTRAINT "FK_fb315c3e8cca65a87d039171b16"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb315c3e8cca65a87d039171b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "txn_split" RENAME COLUMN "txn_id" TO "txnId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4fd889214101aa7c0b226c8046" ON "txn_split" ("txnId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "txn_split" ADD CONSTRAINT "FK_4fd889214101aa7c0b226c8046c" FOREIGN KEY ("txnId") REFERENCES "txn"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
