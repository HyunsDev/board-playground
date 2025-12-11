// packages/backend-core/src/context/http/context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { v7 as uuidv7 } from 'uuid';

import { ContextService } from '../context.service';

import { TriggerCodeEnum } from '@/common/trigger.codes';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly context: ContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // CLS 컨텍스트 시작
    await this.cls.run(async () => {
      // 1. Request ID 처리
      const requestId = (req.headers['x-request-id'] as string) ?? uuidv7();
      this.cls.set('requestId', requestId);
      res.setHeader('X-Request-Id', requestId);

      // 2. Client Info (IP, UserAgent)
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        '0.0.0.0';
      const userAgent = req.get('user-agent') || 'unknown';

      this.context.setClient({ ipAddress, userAgent });

      // 3. Trigger Type
      this.context.setTriggerType(TriggerCodeEnum.Unknown);

      next();
    });
  }
}
