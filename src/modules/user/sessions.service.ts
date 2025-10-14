import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { UserSessionEntity } from 'saved-entities';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(UserSessionEntity)
    private repo: Repository<UserSessionEntity>,
  ) {}

  async create(userId: string, hours: number, ip?: string, ua?: string) {
    const expiresAt = new Date(Date.now() + hours * 3600_000);
    const session = this.repo.create({ userId, expiresAt, ip, userAgent: ua });
    return this.repo.save(session);
  }

  async findActive(sid: string) {
    return this.repo.findOne({
      where: { id: sid, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });
  }

  async revoke(sid: string) {
    await this.repo.update({ id: sid }, { revokedAt: new Date() });
  }
}
