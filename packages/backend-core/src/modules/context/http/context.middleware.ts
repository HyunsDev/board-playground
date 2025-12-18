import { IncomingMessage, ServerResponse } from 'http';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { v7 as uuidv7 } from 'uuid';

import { ClientContext } from '../contexts';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly clientCtx: ClientContext,
  ) {}

  async use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    // CLS 컨텍스트 시작
    await this.cls.run(async () => {
      // 1. Request ID 처리
      const requestId = (req.headers['x-request-id'] as string) ?? uuidv7();
      this.cls.set('requestId', requestId);

      // Result 객체에 Request ID 설정
      res.setHeader('X-Request-Id', requestId);
      const xForwardedFor = req.headers['x-forwarded-for'] as string;
      const ipAddress =
        xForwardedFor?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0';

      const userAgent = req.headers['user-agent'] || 'unknown';

      this.clientCtx.setClient({ ipAddress, userAgent });

      next();
    });
  }
}
