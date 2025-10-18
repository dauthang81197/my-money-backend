import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStravaEntities1760774451473 implements MigrationInterface {
  name = 'UpdateStravaEntities1760774451473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "strava_activities" ADD "user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activities" ADD CONSTRAINT "FK_a7aff43be95b480ed03f2ec6537" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "strava_activities" DROP CONSTRAINT "FK_a7aff43be95b480ed03f2ec6537"`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activities" DROP COLUMN "user_id"`,
    );
  }
}
