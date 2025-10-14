import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserCredentialsRepository } from './user-credentials.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userCredentitalsRepository: UserCredentialsRepository,
  ) {}

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async getCredentials(userId: string) {
    return this.userCredentitalsRepository.findOne({ where: { userId } });
  }

  async touchLastLogin(userId: string) {
    await this.userCredentitalsRepository.update(
      { userId },
      { lastLoginAt: new Date() },
    );
  }
}
