import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { ClsAccessor } from '@/libs/cls';

@Injectable()
export class ClientInfoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.get('user-agent') || 'Unknown';

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      '0.0.0.0';

    // 3. CLS에 저장
    ClsAccessor.setClientInfo({ ip, userAgent });

    next();
  }
}
