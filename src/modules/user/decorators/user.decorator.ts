import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AppUserEntity } from '@saved-project/entities';

export const AuthUser = createParamDecorator(
  (data: keyof AppUserEntity, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user as AppUserEntity;

    return data ? user && user[data] : user;
  }
);
