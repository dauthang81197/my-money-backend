export enum Environment {
  local = 'local',
  production = 'production',
  dev = 'dev',
  test = 'test',
}

import {
  AttachmentEntity,
  BudgetEntity,
  CategoryEntity,
  CurrencyRateEntity,
  MerchantEntity,
  RecurringRuleEntity,
  TagEntity,
  TxnEntity,
  TxnSplitEntity,
  AppUserEntity,
  AccountEntity,
  UserCredentialsEntity,
  UserSessionEntity,
} from 'saved-entities';

export const ENTITIES = [
  AttachmentEntity,
  BudgetEntity,
  CategoryEntity,
  CurrencyRateEntity,
  MerchantEntity,
  RecurringRuleEntity,
  TagEntity,
  TxnEntity,
  TxnSplitEntity,
  AppUserEntity,
  AccountEntity,
  UserCredentialsEntity,
  UserSessionEntity,
];
