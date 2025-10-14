import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppUserEntity } from '@saved-project/entities';
export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: AppUserEntity;
};
