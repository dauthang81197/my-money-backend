import { Injectable } from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UserRepository } from '../user.repository';

@ValidatorConstraint({ name: 'isUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(email: string): Promise<boolean> {
    console.log(this.userRepository);
    const user = await this.userRepository.findOneBy({ email });

    return user === null || user === undefined;
  }

  defaultMessage(): string {
    return 'The email «$value» is already register.';
  }
}
