// src/transactions/dto/create-expense.dto.ts
import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({
    example: '0ca360d0-f200-40a9-b1a1-a3d35ddc1248',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    example: 0,
  })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({
    example: '2025-06-18T09:30:00+07:00',
  })
  @IsDateString()
  occurredAt!: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string; // tên hiển thị “A”, “B” trong ảnh có thể dùng note

  @ApiProperty({
    required: false,
  })
  @IsUUID()
  @IsOptional()
  merchantId?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  currencyCode?: string; // mặc định theo user
}

export class UpdateExpenseDto extends CreateExpenseDto {}
