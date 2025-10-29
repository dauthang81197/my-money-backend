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
        WITH
        params AS (
          SELECT
            $1::uuid AS user_id,
            $2::date AS start_date,
            $3::date AS end_date,
            date_trunc('month', $2::date)::date AS cur_budget_start,
            (date_trunc('month', $2::date) - INTERVAL '1 month')::date AS prev_budget_start
        ),
        -- 💰 Tổng kỳ hiện tại
        current_txn AS (
          SELECT
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN s.amount ELSE 0 END), 0) AS total_expense,
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN s.amount ELSE 0 END), 0) AS total_income
          FROM txn t
          JOIN txn_split s ON s.txn_id = t.id
          JOIN params p ON p.user_id = t.user_id
          WHERE t.transaction_date BETWEEN p.start_date AND p.end_date
        ),
        -- 💰 Tổng kỳ trước
        previous_txn AS (
          SELECT
            COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN s.amount ELSE 0 END), 0) AS total_expense,
            COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN s.amount ELSE 0 END), 0) AS total_income
          FROM txn t
          JOIN txn_split s ON s.txn_id = t.id
          JOIN params p ON p.user_id = t.user_id
          WHERE t.transaction_date BETWEEN
                (p.start_date - (p.end_date - p.start_date) - 1)
                AND (p.start_date - 1)
        ),
        -- 🎯 Ngân sách kỳ hiện tại
        current_budget AS (
          SELECT COALESCE(SUM(b.amount_limit), 0) AS target
          FROM budget b
          JOIN params p ON p.user_id = b.user_id
          WHERE b.period = 'MONTHLY'
          AND b.period_start = p.cur_budget_start
        ),
        -- 🎯 Ngân sách kỳ trước
        previous_budget AS (
          SELECT COALESCE(SUM(b.amount_limit), 0) AS target
          FROM budget b
          JOIN params p ON p.user_id = b.user_id
          WHERE b.period = 'MONTHLY'
          AND b.period_start = p.prev_budget_start
        ),
        -- 📅 Hôm nay & hôm qua
        today_txn AS (
          SELECT COALESCE(SUM(s.amount), 0) AS today_expense
          FROM txn t
          JOIN txn_split s ON s.txn_id = t.id
          JOIN params p ON p.user_id = t.user_id
          WHERE t.type = 'EXPENSE'
          AND t.transaction_date = CURRENT_DATE
        ),
        yesterday_txn AS (
          SELECT COALESCE(SUM(s.amount), 0) AS yesterday_expense
          FROM txn t
          JOIN txn_split s ON s.txn_id = t.id
          JOIN params p ON p.user_id = t.user_id
          WHERE t.type = 'EXPENSE'
          AND t.transaction_date = CURRENT_DATE - 1
        )
      
        SELECT jsonb_build_object(
          'summary', jsonb_build_object(
            'total', ROUND(c.total_expense, 0),
            'totalChange', ROUND(((c.total_expense - p.total_expense) / NULLIF(p.total_expense, 0)) * 100, 1),
      
            'target', ROUND(cb.target, 0),
            'targetChange', ROUND(((cb.target - pb.target) / NULLIF(pb.target, 0)) * 100, 1),
      
            'balance', ROUND(c.total_income - c.total_expense, 0),
            'balanceChange', ROUND(
              (((c.total_income - c.total_expense) - (p.total_income - p.total_expense)) /
              NULLIF((p.total_income - p.total_expense), 0)) * 100, 1),
      
            'today', ROUND(td.today_expense, 0),
            'todayChange', ROUND(
              ((td.today_expense - yd.yesterday_expense) /
              NULLIF(yd.yesterday_expense, 0)) * 100, 1)
          )
        ) AS result
      
        FROM current_txn c
        CROSS JOIN previous_txn p
        CROSS JOIN current_budget cb
        CROSS JOIN previous_budget pb
        CROSS JOIN today_txn td
        CROSS JOIN yesterday_txn yd
  `,
      [userId, startDate, endDate],
    );
    return result[0].result;
  }
}
