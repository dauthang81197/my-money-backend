import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import I18nModuleConfig from './i18n';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionOptions } from './database/ormconfig';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TransactionModule } from './modules/transaction/transaction.module';
import { CategoryModule } from './modules/category/category.module';

export const MODULE_IMPORTS = [
  UserModule,
  AuthModule,
  TransactionModule,
  CategoryModule,
];

@Module({
  imports: [
    ...MODULE_IMPORTS,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    // I18nModuleConfisg,
    TypeOrmModule.forRootAsync({
      useFactory() {
        return connectionOptions;
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    PassportModule.register({ session: false }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
