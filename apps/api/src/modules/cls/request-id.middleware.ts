import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly ctx: RequestContextService) {}

  use(req: any, res: any, next: () => void) {
    const id = uuid();
    this.ctx.setRequestId(id);
    next();
  }
}
