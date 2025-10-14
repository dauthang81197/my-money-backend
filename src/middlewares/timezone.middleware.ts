import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
@Injectable()
export class TimezoneMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    req['timezone'] = req.headers['x-timezone'] || 'UTC';
    next();
  }
}
