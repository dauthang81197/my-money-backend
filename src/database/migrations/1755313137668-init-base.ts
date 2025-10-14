import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitBase1755313137668 implements MigrationInterface {
  name = 'InitBase1755313137668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "budgets" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "category_id" integer, "amount_limit" numeric(12,2) NOT NULL, "period" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer, CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recurring_transactions_type_enum" AS ENUM('income', 'expense')`
    );
    await queryRunner.query(
      `CREATE TABLE "recurring_transactions" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "amount" numeric(12,2) NOT NULL, "type" "public"."recurring_transactions_type_enum" NOT NULL, "description" text, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "interval" character varying NOT NULL, "next_run" date NOT NULL, "user_id" integer, "wallet_id" integer, "category_id" integer, CONSTRAINT "PK_6485db3243762a54992dc0ce3b7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying NOT NULL, "type" character varying NOT NULL, "icon" character varying, "user_id" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "amount" numeric(12,2) NOT NULL, "type" character varying NOT NULL, "description" text, "transaction_date" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" integer, "wallet_id" integer, "category_id" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "wallets" ("id" SERIAL NOT NULL, "status" smallint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "name" character varying NOT NULL, "balance" numeric(12,2) NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'VND', "user_id" integer, CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "fullname" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "email" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_27e688ddf1ff3893b43065899f9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" ADD CONSTRAINT "FK_4bb589bf6db49e8c1fd6af05f49" FOREIGN KEY ("category_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_d78f3002f99b0f15a3797201c92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_8a74a7e3f7a4a3a0a57a48c042e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_eb623e5e626cf95fd42710adf25" FOREIGN KEY ("category_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_96aac72f1574b88752e9fb00089" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_92558c08091598f7a4439586cda" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_92558c08091598f7a4439586cda"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_0b171330be0cb621f8d73b87a9e"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_96aac72f1574b88752e9fb00089"`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_eb623e5e626cf95fd42710adf25"`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_8a74a7e3f7a4a3a0a57a48c042e"`
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_d78f3002f99b0f15a3797201c92"`
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_4bb589bf6db49e8c1fd6af05f49"`
    );
    await queryRunner.query(
      `ALTER TABLE "budgets" DROP CONSTRAINT "FK_27e688ddf1ff3893b43065899f9"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullname"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "user_id" integer`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "recurring_transactions"`);
    await queryRunner.query(
      `DROP TYPE "public"."recurring_transactions_type_enum"`
    );
    await queryRunner.query(`DROP TABLE "budgets"`);
  }
}
