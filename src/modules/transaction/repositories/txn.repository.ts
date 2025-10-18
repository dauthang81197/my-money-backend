import { TypeORMRepository } from '../../../database/typeorm.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TxnEntity } from 'saved-entities';

export class TxnRepository extends TypeORMRepository<TxnEntity> {
  constructor(
    @InjectRepository(TxnEntity)
    repository: Repository<TxnEntity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async getCountCategories(userId: string, startDate: Date, endDate: Date) {
    const qb = this.createQueryBuilder('t')
      .leftJoin('t.splits', 's')
      .leftJoin('s.category', 'c')
      .select('c.id', 'categoryId')
      .addSelect('c.name', 'categoryName')
      .addSelect('SUM(s.amount)', 'totalAmount')
      .where('t.userId = :userId', { userId })
      .andWhere('t.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('"totalAmount"', 'DESC');

    return await qb.getRawMany();
  }

  async getDashboard(userId: string, startDate: Date, endDate: Date) {
    const result = await this.query(
      `
        with
        -- 📆 Thời gian hiện tại
        params as (
          select
            $1::uuid as user_id,
            $2::date as start_date,
            $3::date as end_date,
            ($2::date - (($3::date - $2::date) + 1)) as prev_start,
            ($2::date - 1) as prev_end
        ),
        -- 💰 Tổng kỳ hiện tại
        current_txn as (
          select
            SUM(case when t.type = 'EXPENSE' then s.amount else 0 end) as total_expense,
            SUM(case when t.type = 'INCOME' then s.amount else 0 end) as total_income
          from
            txn t
              join txn_split s on
              s.txn_id = t.id
              join params p on
              p.user_id = t.user_id
          where
            t.transaction_date between p.start_date and p.end_date
        ),
        -- 💰 Tổng kỳ trước
        previous_txn as (
          select
            SUM(case when t.type = 'EXPENSE' then s.amount else 0 end) as total_expense,
            SUM(case when t.type = 'INCOME' then s.amount else 0 end) as total_income
          from
            txn t
              join txn_split s on
              s.txn_id = t.id
              join params p on
              p.user_id = t.user_id
          where
            t.transaction_date between p.prev_start and p.prev_end
        ),
        -- 🎯 Mục tiêu kỳ hiện tại
        --current_budget AS (
        --  SELECT COALESCE(SUM(b.target_amount), 0) AS target
        --  FROM budget b
        --  JOIN params p ON p.user_id = b.user_id
        --  WHERE b.start_date <= p.end_date AND b.end_date >= p.start_date
        --),
        -- 🎯 Mục tiêu kỳ trước
        --previous_budget AS (
        --  SELECT COALESCE(SUM(b.target_amount), 0) AS target
        --  FROM budget b
        --  JOIN params p ON p.user_id = b.user_id
        --  WHERE b.start_date <= p.prev_end AND b.end_date >= p.prev_start
        --),
        -- 📅 Hôm nay & hôm qua
        today_txn as (
          select
            coalesce(SUM(s.amount), 0) as today_expense
          from
            txn t
              join txn_split s on
              s.txn_id = t.id
              join params p on
              p.user_id = t.user_id
          where
            t.type = 'EXPENSE'
            and t.transaction_date = CURRENT_DATE
        ),
        yesterday_txn as (
          select
            coalesce(SUM(s.amount), 0) as yesterday_expense
          from
            txn t
              join txn_split s on
              s.txn_id = t.id
              join params p on
              p.user_id = t.user_id
          where
            t.type = 'EXPENSE'
            and t.transaction_date = CURRENT_DATE - 1
        )
        -- 🧩 Tổng hợp tất cả
                select
                  jsonb_build_object(
                    'summary', jsonb_build_object(
                    'total', ROUND(c.total_expense, 0),
                    'totalChange', ROUND(((c.total_expense - p.total_expense) / nullif(p.total_expense, 0)) * 100, 1),
        
                    --    'target', ROUND(cb.target, 0),
                    --    'targetChange', ROUND(((cb.target - pb.target) / NULLIF(pb.target, 0)) * 100, 1),
        
                    'balance', ROUND(c.total_income - c.total_expense, 0),
                    'balanceChange', ROUND((
                                             ((c.total_income - c.total_expense) - (p.total_income - p.total_expense))
                                               / nullif((p.total_income - p.total_expense), 0)
                                             ) * 100, 1),
        
                    'today', ROUND(td.today_expense, 0),
                    'todayChange', ROUND(((td.today_expense - yd.yesterday_expense) / nullif(yd.yesterday_expense, 0)) * 100, 1)
                               )
                  ) as result
                from
                  current_txn c
                    cross join previous_txn p
                    --CROSS JOIN current_budget cb
                    --CROSS JOIN previous_budget pb
                    cross join today_txn td
                    cross join yesterday_txn yd
      `,
      [userId, startDate, endDate],
    );
    return result[0].result;
  }
}
