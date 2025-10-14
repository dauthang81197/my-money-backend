import { AppUserEntity } from 'saved-entities';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeORMRepository } from '../../database/typeorm.repository';

@Injectable()
export class UserRepository extends TypeORMRepository<AppUserEntity> {
  constructor(dataSource: DataSource) {
    super(AppUserEntity, dataSource.createEntityManager());
  }
}
