import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTxnEntity1760762156713 implements MigrationInterface {
  name = 'UpdateTxnEntity1760762156713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "txn" DROP CONSTRAINT "FK_69d0f5d336ad1ec246446fd89af"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_19f897a9019d6cb928b3ee9478"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e449a250d49b0b2ddd6f9e090b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "txn" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_298e30351f2edd0a7968ba874d" ON "txn" ("user_id", "type", "transaction_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_141c990e1005cb164f4e7e6fb5" ON "txn" ("user_id", "transaction_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "txn" ADD CONSTRAINT "FK_75e3c67e0f53977eef1fd5a3df6" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "txn" DROP CONSTRAINT "FK_75e3c67e0f53977eef1fd5a3df6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_141c990e1005cb164f4e7e6fb5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_298e30351f2edd0a7968ba874d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "txn" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e449a250d49b0b2ddd6f9e090b" ON "txn" ("userId", "transaction_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19f897a9019d6cb928b3ee9478" ON "txn" ("userId", "type", "transaction_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "txn" ADD CONSTRAINT "FK_69d0f5d336ad1ec246446fd89af" FOREIGN KEY ("userId") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
