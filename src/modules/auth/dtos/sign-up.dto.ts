import { IsDefined, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUp {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly fullname: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  // @Validate(IsUserAlreadyExist)
  readonly email: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
