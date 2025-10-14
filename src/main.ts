import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
dotenv.config({ path: join(__dirname, '..', '.env') });

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    })
  );

  app.use(cookieParser(process.env.APP_SECRET));

  // app.use(
  //   session({
  //     secret: process.env.APP_SECRET as string,
  //     resave: false,
  //     saveUninitialized: false,
  //     store: new session.MemoryStore(),
  //     cookie: {
  //       httpOnly: true,
  //       signed: true,
  //       sameSite: 'strict',
  //       secure: process.env.NODE_ENV === 'production',
  //     },
  //   })
  // );
  setupSwagger(app);
  app.use(passport.initialize());
  // app.use(passport.session());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(/\s*,\s*/) ?? '*',
    credentials: true,
    exposedHeaders: ['Authorization'],
  });

  await app.listen(configService.get('APP_PORT')).then(() => {
    Logger.log('Server listening on port ' + configService.get('APP_PORT'));
  });
}

bootstrap();
