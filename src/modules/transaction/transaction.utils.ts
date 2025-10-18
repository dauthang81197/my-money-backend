import { DateTime } from 'luxon';
import { BadRequestException } from '@nestjs/common';
import { ListExpenseRangeQuery } from './dtos/list-expense-query.dto';

export const getRangeTime = (q: ListExpenseRangeQuery) => {
  const start = DateTime.fromFormat(q.startDate, 'yyyy-MM-dd');
  const end = DateTime.fromFormat(q.endDate, 'yyyy-MM-dd');

  if (!start.isValid || !end.isValid) {
    throw new BadRequestException(
      'startDate/endDate không hợp lệ (YYYY-MM-DD)',
    );
  }
  if (end < start) {
    throw new BadRequestException('endDate phải >= startDate');
  }

  const startD = start.toISODate()!;
  const endD = end.plus({ days: 1 }).toISODate()!;
  return { startD, endD };
};
