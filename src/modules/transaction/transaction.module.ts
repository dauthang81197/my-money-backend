import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AccountEntity,
  AppUserEntity,
  CategoryEntity,
  TxnEntity,
  TxnSplitEntity,
} from 'saved-entities';
import { TxnRepository } from './repositories/txn.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TxnEntity,
      TxnSplitEntity,
      AccountEntity,
      CategoryEntity,
      AppUserEntity,
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TxnRepository],
})
export class TransactionModule {}
