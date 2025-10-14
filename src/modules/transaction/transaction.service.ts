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
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { ListExpenseRangeQuery } from './dtos/list-expense-query.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TxnEntity)
    private readonly txnRepo: Repository<TxnEntity>,
    @InjectRepository(TxnSplitEntity)
    private readonly splitRepo: Repository<TxnSplitEntity>,
    @InjectRepository(AccountEntity)
    private readonly accRepo: Repository<AccountEntity>,
    @InjectRepository(CategoryEntity)
    private readonly catRepo: Repository<CategoryEntity>,
    @InjectRepository(AppUserEntity)
    private readonly userRepo: Repository<AppUserEntity>,
  ) {}

  async createExpense(userId: string, dto: CreateExpenseDto) {
    const [acc, cat, user] = await Promise.all([
      this.accRepo.findOne({ where: { userId } }),
      this.catRepo.findOne({ where: { id: dto.categoryId, userId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    if (!acc) throw new NotFoundException('Account not found');
    if (!cat) throw new NotFoundException('Category not found');
    if (!user) throw new NotFoundException('User not found');

    const tz = user.tz ?? 'Asia/Ho_Chi_Minh';
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
    const tz = user?.tz ?? 'Asia/Ho_Chi_Minh';

    const start = DateTime.fromFormat(q.startDate, 'yyyy-MM-dd', { zone: tz });
    const end = DateTime.fromFormat(q.endDate, 'yyyy-MM-dd', { zone: tz });

    if (!start.isValid || !end.isValid) {
      throw new BadRequestException(
        'startDate/endDate không hợp lệ (YYYY-MM-DD)',
      );
    }
    if (end < start) {
      throw new BadRequestException('endDate phải >= startDate');
    }

    // query theo cột transactionDate (đã là "ngày theo tz user")
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
}
