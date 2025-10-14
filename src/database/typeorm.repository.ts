import { Repository, ObjectLiteral } from 'typeorm';

import {
  PaginationOrPagingParams,
  PaginationParams,
  PaginationResult,
} from '../interfaces';

export class TypeORMRepository<T extends ObjectLiteral> extends Repository<T> {
  async list(query: PaginationParams<T>): Promise<PaginationResult<T>> {
    const { limit = 10, page = 1 } = query;
    let queryBuilder = query.queryBuilder;

    if (!queryBuilder) {
      queryBuilder = this.createQueryBuilder('document').orderBy(
        'document.createdAt',
        'ASC'
      );
    }

    const [data, count] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      // .limit(limit || 10)
      // .offset((page - 1) * limit || 0)
      .getManyAndCount();

    /**
     * SelectQueryBuilder.d.ts (line 512)
     * Set's OFFSET - selection offset.
     * NOTE that it may not work as you expect if you are using joins.
     * If you want to implement pagination, and you are having join in your query,
     * then use instead skip method instead.
     */
    return {
      data,
      count,
      currentPage: page,
      totalPage: Math.ceil(count / limit),
    };
  }

  async listOrPaging(
    query: PaginationOrPagingParams<T>
  ): Promise<PaginationResult<T>> {
    const { limit = 10, page = 1, isSelectAll } = query;
    let queryBuilder = query.queryBuilder;

    if (!queryBuilder) {
      queryBuilder = this.createQueryBuilder('document').orderBy(
        'document.createdAt',
        'ASC'
      );
    }

    if (isSelectAll) {
      const data = await queryBuilder.getMany();
      return {
        data,
        count: data.length,
        currentPage: 1,
        totalPage: 1,
      };
    }

    const [data, count] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      // .limit(limit || 10)
      // .offset((page - 1) * limit || 0)
      .getManyAndCount();

    /**
     * SelectQueryBuilder.d.ts (line 512)
     * Set's OFFSET - selection offset.
     * NOTE that it may not work as you expect if you are using joins.
     * If you want to implement pagination, and you are having join in your query,
     * then use instead skip method instead.
     */
    return {
      data,
      count,
      currentPage: page,
      totalPage: Math.ceil(count / limit),
    };
  }
}
