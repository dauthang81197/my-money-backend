// src/transactions/dto/list-expense-range.query.ts
import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListExpenseRangeQuery {
  /** YYYY-MM-DD (theo timezone user, inclusive) */
  @ApiProperty({
    example: '2025-06-01',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate!: string;

  /** YYYY-MM-DD (theo timezone user, inclusive) */
  @ApiProperty({
    example: '2025-06-30',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate!: string;
}
