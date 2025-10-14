import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { IsUserAlreadyExist } from './validators/is-user-already-exits.validator';
import {
  AppUserEntity,
  UserCredentialsEntity,
  UserSessionEntity,
} from '@saved-project/entities';
import { UserCredentialsRepository } from './user-credentials.repository';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppUserEntity,
      UserCredentialsEntity,
      UserSessionEntity,
    ]),
  ],
  providers: [
    UserService,
    SessionsService,
    UserRepository,
    IsUserAlreadyExist,
    UserCredentialsRepository,
  ],
  exports: [
    UserService,
    SessionsService,
    UserRepository,
    IsUserAlreadyExist,
    UserCredentialsRepository,
  ],
})
export class UserModule {}
