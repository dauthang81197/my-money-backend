import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, Max, Min } from 'class-validator';

export class QueryPaginationDto {
  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default page 1. Min is 1',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  page = 1;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default limit 10 rows. Min is 1 and max is 100',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(100)
  limit = 10;
}

export class QueryListOrPaginationDto {
  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default page 1. Min is 1',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  page = 1;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default limit 10 rows. Min is 1 and max is 100',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: 'Default is false. If true, return all rows ',
  })
  @Transform(({ value }) => {
    return value === 'true' || value === true;
  })
  @IsBoolean()
  @Optional()
  isSelectAll = false;
}
