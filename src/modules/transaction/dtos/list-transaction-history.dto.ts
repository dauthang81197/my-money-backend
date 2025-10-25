import { ApiProperty } from '@nestjs/swagger';
import { QueryPaginationDto } from '../../../common/dtos/query-pagination.dto';
import { Optional } from '@nestjs/common';
import { SortCommonEnum } from '../../../common';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class QueryTransactionHistoryReqDto extends QueryPaginationDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Search by ID, Name',
  })
  @Optional()
  searchKey = '';

  @ApiProperty({
    enum: SortCommonEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortCommonEnum)
  sortBy: SortCommonEnum;

  @ApiProperty({
    example: '2025-06-30',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date: string;
}
