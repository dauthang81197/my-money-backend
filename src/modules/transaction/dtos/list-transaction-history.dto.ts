import { ApiProperty } from '@nestjs/swagger';
import { QueryPaginationDto } from '../../../common/dtos/query-pagination.dto';
import { Optional } from '@nestjs/common';
import { SortCommonEnum } from '../../../common';
import { IsEnum, IsOptional } from 'class-validator';

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
}
