import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { ClsAccessor } from '@/libs/cls';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const id = uuid();
    ClsAccessor.setRequestId(id);
    res.setHeader('X-Request-Id', id);
    next();
  }
}
