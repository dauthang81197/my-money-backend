import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import fetch from 'node-fetch';
import {
  StravaActivityEntity,
  StravaActivityMapEntity,
  StravaActivityStatEntity,
  StravaAthleteEntity,
} from 'saved-entities';

export default class StravaSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('🚀 Running StravaSeeder...');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const activityRepo =
        queryRunner.manager.getRepository(StravaActivityEntity);
      const mapRepo = queryRunner.manager.getRepository(
        StravaActivityMapEntity,
      );
      const statRepo = queryRunner.manager.getRepository(
        StravaActivityStatEntity,
      );
      const athleteRepo =
        queryRunner.manager.getRepository(StravaAthleteEntity);

      const ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?access_token=${ACCESS_TOKEN}`,
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch Strava data: ${res.status} ${res.statusText}`,
        );
      }

      const activities = (await res.json()) as StravaResponse[];

      console.log(`📦 Received ${activities.length} activities`);

      for (const a of activities) {
        // 1️⃣ Athlete
        if (a.athlete?.id) {
          await athleteRepo.upsert(
            { id: String(a.athlete.id), first_name: null, last_name: null },
            ['id'],
          );
        }

        // 2️⃣ Activity - create first
        const activity = activityRepo.create({
          id: String(a.id),
          athlete_id: String(a.athlete.id),
          name: a.name,
          type: a.type,
          sport_type: a.sport_type,
          distance: a.distance,
          moving_time: a.moving_time,
          elapsed_time: a.elapsed_time,
          total_elevation_gain: a.total_elevation_gain,
          start_date: new Date(a.start_date),
          start_date_local: new Date(a.start_date_local),
          timezone: a.timezone,
          utc_offset: a.utc_offset,
          location_city: a.location_city,
          location_state: a.location_state,
          location_country: a.location_country,
          average_speed: a.average_speed,
          max_speed: a.max_speed,
          elev_high: a.elev_high,
          elev_low: a.elev_low,
          trainer: a.trainer,
          commute: a.commute,
          manual: a.manual,
          private: a.private,
          visibility: a.visibility,
          has_heartrate: a.has_heartrate,
          heartrate_opt_out: a.heartrate_opt_out,
          external_id: a.external_id,
          upload_id: String(a.upload_id),
          gear_id: a.gear_id,
        });

        // 👇 Lưu activity ngay — đảm bảo có trước khi map insert
        await activityRepo.save(activity);

        // 3️⃣ Map - insert sau khi activity tồn tại
        if (a.map?.id) {
          const map = mapRepo.create({
            id: a.map.id,
            summary_polyline: a.map.summary_polyline,
            resource_state: a.map.resource_state,
            activity_id: String(a.id),
          });
          await mapRepo.save(map);
        }

        // 4️⃣ Stat
        const stat = statRepo.create({
          activity_id: String(a.id),
          achievement_count: a.achievement_count || 0,
          kudos_count: a.kudos_count || 0,
          comment_count: a.comment_count || 0,
          athlete_count: a.athlete_count || 0,
          photo_count: a.photo_count || 0,
          pr_count: a.pr_count || 0,
          total_photo_count: a.total_photo_count || 0,
          has_kudoed: a.has_kudoed || false,
        });
        await statRepo.save(stat);
      }

      console.log(`✅ Seeded ${activities.length} activities successfully`);
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('❌ Error seeding Strava data:', error);
      console.log('⏪ Rolling back transaction...');
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      console.log('🧹 Transaction closed');
    }
  }
}

export interface StravaResponse {
  resource_state: number;
  athlete: Athlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: any;
  location_state: any;
  location_country: any;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: Map;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: any;
  start_latlng: number[];
  end_latlng: number[];
  average_speed: number;
  max_speed: number;
  has_heartrate: boolean;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high: number;
  elev_low: number;
  upload_id: number;
  upload_id_str: string;
  external_id: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
}

export interface Athlete {
  id: number;
  resource_state: number;
}

export interface Map {
  id: string;
  summary_polyline: string;
  resource_state: number;
}
