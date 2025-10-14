// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserCredentialsEntity } from '@saved-project/entities';
import { TypeORMRepository } from '../../database/typeorm.repository';

@Injectable()
export class UserCredentialsRepository extends TypeORMRepository<UserCredentialsEntity> {
  constructor(dataSource: DataSource) {
    super(UserCredentialsEntity, dataSource.createEntityManager());
  }

  async getCredentials(userId: string) {
    return this.findOne({ where: { userId } });
  }

  async touchLastLogin(userId: string) {
    await this.update({ userId }, { lastLoginAt: new Date() });
  }
}
