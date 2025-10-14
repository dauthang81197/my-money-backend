import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dtos/create-expense.dto';
import { ListExpenseRangeQuery } from './dtos/list-expense-query.dto';
import { Authenticate } from '../../decorators/auth.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { QueryTransactionHistoryReqDto } from './dtos/list-transaction-history.dto';
import { GetTimezone } from '../../decorators';

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
  createExpense(
    @Req() req: any,
    @Body() dto: CreateExpenseDto,
    @GetTimezone() tz: string,
  ) {
    const userId = req.user.userId as string;
    return this.service.createExpense(userId, dto, tz);
  }

  @Get(':id/expense')
  getExpenses(@Param('id') id: string, @GetTimezone() tz: string) {
    return this.service.getTransaction(id);
  }

  @Delete(':id/expense')
  deleteExpenses(@Param('id') id: string, @GetTimezone() tz: string) {
    return this.service.deleteTransaction(id);
  }

  @Put(':id/expense')
  editExpenses(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @GetTimezone() tz: string,
  ) {
    return this.service.updateTransaction(id, dto, tz);
  }

  @Get('expenses')
  listExpenses(
    @Req() req: any,
    @Query() q: ListExpenseRangeQuery,
    @GetTimezone() tz: string,
  ) {
    const userId = req.user.userId as string;
    return this.service.listExpensesByRange(userId, q);
  }
}
