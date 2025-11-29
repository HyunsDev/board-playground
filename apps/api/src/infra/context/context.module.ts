import { Global, Module } from '@nestjs/common';
import { Request } from 'express';
import { ClsModule } from 'nestjs-cls';
import { v7 as uuidv7 } from 'uuid';

import { ContextService } from './context.service';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) => (req.headers['x-request-id'] as string) ?? uuidv7(),
        setup: (cls, req: Request) => {
          const ipAddress =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
            req.socket.remoteAddress ||
            req.ip ||
            '0.0.0.0';
          const userAgent = req.get('user-agent') || 'unknown';
          cls.set('client', { ipAddress, userAgent });
        },
      },
    }),
  ],
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule {}
