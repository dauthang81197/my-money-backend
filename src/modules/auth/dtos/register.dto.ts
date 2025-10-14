// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Password tối thiểu 8 ký tự' })
  // ít nhất 1 chữ, 1 số (bạn có thể nới lỏng)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, {
    message: 'Password cần có chữ và số',
  })
  password!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'Asia/Ho_Chi_Minh',
  })
  @IsString()
  @IsOptional()
  tz?: string; // mặc định Asia/Ho_Chi_Minh

  @ApiProperty({
    example: 'VND',
  })
  @IsString()
  @IsOptional()
  currencyCode?: string; // mặc định VND

  @ApiProperty({
    example: true,
  })
  @IsBoolean()
  acceptTerms!: boolean; // bắt buộc true (điều khoản)
}
