import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'saved-entities';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  async getMyCategory(userId: string) {
    return await this.categoryRepo.find({
      where: {
        userId,
        deleteAt: IsNull(),
      },
    });
  }
}
