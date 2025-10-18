import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppUserEntity } from 'saved-entities';
export class LoginDto {
  @ApiProperty({
    example: 'dauthang811@gmail.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin@123',
  })
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
