import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { buildConnectionOptions } from '@saved-project/entities';
import { Environment } from '../constants';
const connectionOptions: TypeOrmModuleOptions &
  SeederOptions &
  DataSourceOptions = buildConnectionOptions({
  host: process.env.DATABASE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_POSTGRES_PORT || '5432', 10),
  username: process.env.DATABASE_POSTGRES_USERNAME || 'postgres',
  password: process.env.DATABASE_POSTGRES_PASSWORD || 'Admin@123',
  database: process.env.DATABASE_POSTGRES_NAME || 'postgres',
  environment: (process.env.ENV as Environment) ?? Environment.local,
});

const dataSource = new DataSource(connectionOptions);
export { connectionOptions, dataSource };
