import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStravaEntities1760770484032 implements MigrationInterface {
  name = 'CreateStravaEntities1760770484032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "strava_athletes" ("id" bigint NOT NULL, "first_name" text, "last_name" text, "profile_medium" text, "profile" text, "city" text, "country" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d98dc77be8974e2318342ac1334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "strava_activity_maps" ("id" text NOT NULL, "summary_polyline" text, "resource_state" integer, "activity_id" bigint NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_c4a12823138049bf0a71c96bc0" UNIQUE ("activity_id"), CONSTRAINT "PK_84ce98265cf5c89e7cf89a9be2a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "strava_activity_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "activity_id" bigint NOT NULL, "achievement_count" integer NOT NULL DEFAULT '0', "kudos_count" integer NOT NULL DEFAULT '0', "comment_count" integer NOT NULL DEFAULT '0', "athlete_count" integer NOT NULL DEFAULT '0', "photo_count" integer NOT NULL DEFAULT '0', "pr_count" integer NOT NULL DEFAULT '0', "total_photo_count" integer NOT NULL DEFAULT '0', "has_kudoed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_da2c258b02a693a0c1fe67141f" UNIQUE ("activity_id"), CONSTRAINT "PK_f09c3ca2ee00c7633c10ad3a9af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "strava_activities" ("id" bigint NOT NULL, "athlete_id" bigint NOT NULL, "name" text NOT NULL, "type" text, "sport_type" text, "distance" numeric(10,2) NOT NULL, "moving_time" integer NOT NULL, "elapsed_time" integer NOT NULL, "total_elevation_gain" numeric(6,2), "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "start_date_local" TIMESTAMP WITH TIME ZONE NOT NULL, "timezone" text, "utc_offset" integer, "location_city" text, "location_state" text, "location_country" text, "average_speed" numeric(6,3), "max_speed" numeric(6,3), "elev_high" numeric(6,2), "elev_low" numeric(6,2), "trainer" boolean NOT NULL DEFAULT false, "commute" boolean NOT NULL DEFAULT false, "manual" boolean NOT NULL DEFAULT false, "private" boolean NOT NULL DEFAULT false, "visibility" text, "has_heartrate" boolean NOT NULL DEFAULT false, "heartrate_opt_out" boolean NOT NULL DEFAULT false, "external_id" text, "upload_id" bigint, "gear_id" text, "map_id" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_9cd3ed8994575df6018a96fef5" UNIQUE ("map_id"), CONSTRAINT "PK_cd9393ffa99ebfd589ed06208f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d24689f78d22512a2a9bc7d5a7" ON "strava_activities" ("athlete_id", "start_date_local") `,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activity_maps" ADD CONSTRAINT "FK_c4a12823138049bf0a71c96bc04" FOREIGN KEY ("activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activity_stats" ADD CONSTRAINT "FK_da2c258b02a693a0c1fe67141fb" FOREIGN KEY ("activity_id") REFERENCES "strava_activities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activities" ADD CONSTRAINT "FK_8d1f3e4225e110ebb24fd057b1e" FOREIGN KEY ("athlete_id") REFERENCES "strava_athletes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activities" ADD CONSTRAINT "FK_9cd3ed8994575df6018a96fef52" FOREIGN KEY ("map_id") REFERENCES "strava_activity_maps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "strava_activities" DROP CONSTRAINT "FK_9cd3ed8994575df6018a96fef52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activities" DROP CONSTRAINT "FK_8d1f3e4225e110ebb24fd057b1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activity_stats" DROP CONSTRAINT "FK_da2c258b02a693a0c1fe67141fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "strava_activity_maps" DROP CONSTRAINT "FK_c4a12823138049bf0a71c96bc04"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d24689f78d22512a2a9bc7d5a7"`,
    );
    await queryRunner.query(`DROP TABLE "strava_activities"`);
    await queryRunner.query(`DROP TABLE "strava_activity_stats"`);
    await queryRunner.query(`DROP TABLE "strava_activity_maps"`);
    await queryRunner.query(`DROP TABLE "strava_athletes"`);
  }
}
