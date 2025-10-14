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
}
