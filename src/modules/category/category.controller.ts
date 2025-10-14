import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Authenticate } from '../../decorators/auth.decorator';
import { ListExpenseRangeQuery } from '../transaction/dtos/list-expense-query.dto';
import { TransactionService } from '../transaction/transaction.service';
import { CategoryService } from './category.service';
import { GetUser } from '../../decorators/get-user.decorator';

@Controller('categories')
@ApiTags('categories')
@Authenticate()
export class CategoryController {
  constructor(private readonly service: CategoryService) {}
  @Get('my-category')
  listExpenses(@GetUser() userLogin) {
    const userId = userLogin.userId as string;
    return this.service.getMyCategory(userId);
  }
}
