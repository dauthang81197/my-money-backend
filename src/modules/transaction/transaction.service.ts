import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountEntity,
  AppUserEntity,
  CategoryEntity,
  TxnEntity,
  TxnSplitEntity,
  TxnType,
} from 'saved-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DateTime } from 'luxon';
import { ListExpenseRangeQuery } from './dtos/list-expense-query.dto';
import { QueryTransactionHistoryReqDto } from './dtos/list-transaction-history.dto';
import { SortCommonEnum } from '../../common';
import { PaginationResult } from '../../interfaces';
import { TxnRepository } from './repositories/txn.repository';
import { getRangeTime } from './transaction.utils';

@Injectable()
export class TransactionService {
  constructor(
    private readonly txnRepo: TxnRepository,
    @InjectRepository(TxnSplitEntity)
    private readonly splitRepo: Repository<TxnSplitEntity>,
    @InjectRepository(AccountEntity)
    private readonly accRepo: Repository<AccountEntity>,
    @InjectRepository(CategoryEntity)
    private readonly catRepo: Repository<CategoryEntity>,
    @InjectRepository(AppUserEntity)
    private readonly userRepo: Repository<AppUserEntity>,
  ) {}

  async createExpense(userId: string, dto: CreateExpenseDto, tz: string) {
    const [acc, cat, user] = await Promise.all([
      this.accRepo.findOne({ where: { userId } }),
      this.catRepo.findOne({ where: { id: dto.categoryId, userId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    if (!acc) throw new NotFoundException('Account not found');
    if (!cat) throw new NotFoundException('Category not found');
    if (!user) throw new NotFoundException('User not found');

    const occurred = DateTime.fromISO(dto.occurredAt);
    const occurredUtc = occurred.toUTC();
    const txnDate = occurredUtc.setZone(tz).toISODate(); // yyyy-mm-dd

    const currency =
      dto.currencyCode ?? acc.currencyCode ?? user.currencyCode ?? 'VND';

    const txn = this.txnRepo.create({
      userId,
      accountId: acc.id,
      type: TxnType.EXPENSE,
      amount: dto.amount,
      currencyCode: currency,
      transactionTime: occurredUtc.toJSDate(),
      transactionDate: txnDate!,
      note: dto.note,
      merchantId: dto.merchantId,
    });
    await this.txnRepo.save(txn);

    const split = this.splitRepo.create({
      txnId: txn.id,
      categoryId: dto.categoryId,
      amount: dto.amount,
    });
    await this.splitRepo.save(split);

    // trả về dữ liệu gọn cho UI list
    return {
      id: txn.id,
      date: txn.transactionDate, // '2025-06-18'
      title: dto.note ?? cat.name,
      amount: txn.amount,
      currencyCode: txn.currencyCode,
      category: { id: cat.id, name: cat.name, icon: cat.icon, kind: cat.kind },
    };
  }

  async listExpensesByRange(userId: string, q: ListExpenseRangeQuery) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

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
    const endExclusive = end.plus({ days: 1 }).toISODate()!; // nửa mở

    const rows = await this.txnRepo
      .createQueryBuilder('t')
      .select('DATE(t.transactionDate)', 'date')
      .addSelect('SUM(s.amount)', 'totalAmount')
      .leftJoin('t.splits', 's')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: TxnType.EXPENSE })
      .andWhere('t.transactionDate >= :startD AND t.transactionDate < :endD', {
        startD,
        endD: endExclusive,
      })
      .andWhere('t.deleted_at IS NULL')
      .groupBy('DATE(t.transactionDate)')
      .orderBy('DATE(t.transactionDate)', 'DESC')
      .getRawMany();
    return rows;
  }

  async getTransactionHistory(
    query: QueryTransactionHistoryReqDto,
    userLogin,
  ): Promise<PaginationResult<TxnEntity>> {
    const { limit, page } = query;
    const qb = this.qbGetList(query, userLogin);
    return await this.txnRepo.list({
      limit: limit,
      page: page,
      queryBuilder: qb,
    });
  }

  async getCountCategories(userId: string, q: ListExpenseRangeQuery) {
    const { startD, endD } = getRangeTime(q);
    return this.txnRepo.getCountCategories(userId, startD, endD);
  }

  async getDashboard(userId: string, q: ListExpenseRangeQuery) {
    const { startD, endD } = getRangeTime(q);
    return this.txnRepo.getDashboard(userId, startD, endD);
  }

  private qbGetList(
    query: QueryTransactionHistoryReqDto,
    useLogin,
  ): SelectQueryBuilder<TxnEntity> {
    const qb = this.txnRepo
      .createQueryBuilder('t')
      .select([
        't.id',
        't.type',
        't.note',
        't.amount',
        't.transactionTime',
        't.transactionDate',
        'splits.id',
        'c.id',
        'c.name',
      ])
      .leftJoin('t.splits', 'splits')
      .leftJoin('splits.category', 'c');
    qb.where('t.userId = :userId', {
      userId: useLogin?.userId,
    });
    this.qbWithQuery(qb, query);

    return qb;
  }

  private qbWithQuery(
    qb: SelectQueryBuilder<TxnEntity>,
    query: QueryTransactionHistoryReqDto,
  ) {
    if (query) {
      const { searchKey, sortBy, date } = query;

      if (searchKey) {
        const upperCaseSearchKey = searchKey.toUpperCase();
        qb.andWhere('(UPPER(t.note) LIKE :note)', {
          note: `%${upperCaseSearchKey}%`,
        });
      }

      if (date) {
        qb.andWhere('t.transactionDate = :date', {
          date,
        });
      }

      switch (sortBy) {
        case SortCommonEnum.DATE_ASC:
          qb.orderBy('t.transactionTime', SortCommonEnum.ASC);
          break;
        case SortCommonEnum.DATE_DESC:
          qb.orderBy('t.transactionTime', SortCommonEnum.DESC);
          break;
        default:
          qb.orderBy('t.transactionTime', SortCommonEnum.DESC);
      }
    }
  }

  async getTransaction(id: string) {
    return await this.txnRepo.findOne({
      where: {
        id,
      },
      relations: ['splits', 'splits.category'],
    });
  }

  async deleteTransaction(id: string) {
    const txn = await this.getTransaction(id);
    if (txn) {
      await Promise.all([
        this.splitRepo.softDelete(id),
        this.txnRepo.softDelete(id),
      ]);
      return {
        message: 'Deleted',
      };
    }
    throw new NotFoundException();
  }

  async updateTransaction(id: string, dto: UpdateExpenseDto, tz) {
    const txn = await this.getTransaction(id);
    if (!txn) {
      throw new NotFoundException();
    }
    const occurred = DateTime.fromISO(dto.occurredAt);
    const occurredUtc = occurred.toUTC();
    const txnDate = occurredUtc.setZone(tz).toISODate();

    await Promise.all([
      this.splitRepo.update(id, {
        categoryId: dto?.categoryId,
        amount: dto?.amount,
      }),
      this.txnRepo.update(txn?.splits?.[0]?.id, {
        amount: dto?.amount,
        note: dto?.note,
        merchantId: dto?.merchantId,
        transactionDate: txnDate!,
        transactionTime: occurredUtc,
      }),
    ]);

    return {
      message: 'Updated',
    };
  }
}
