import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateExpenseDto } from './dtos/create-expense.dto';
import { ListExpenseRangeQuery } from './dtos/list-expense-query.dto';
import { Authenticate } from '../../decorators/auth.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { QueryTransactionHistoryReqDto } from './dtos/list-transaction-history.dto';

@Controller('transaction')
@ApiTags('transaction')
@Authenticate()
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Get('histories')
  listHistory(@GetUser() userLogin, @Query() q: QueryTransactionHistoryReqDto) {
    return this.service.getTransactionHistory(q, userLogin);
  }

  @Post('expense')
  createExpense(@Req() req: any, @Body() dto: CreateExpenseDto) {
    const userId = req.user.userId as string;
    return this.service.createExpense(userId, dto);
  }

  @Get('expenses')
  listExpenses(@Req() req: any, @Query() q: ListExpenseRangeQuery) {
    const userId = req.user.userId as string;
    return this.service.listExpensesByRange(userId, q);
  }
}
