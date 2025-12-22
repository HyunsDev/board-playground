import { DynamicModule, Inject, Module, Optional } from '@nestjs/common';

import { SseConnectionService } from './sse-connection.service';
import { SseEventController } from './sse.event.controller';
import { SseHttpController } from './sse.http.controller';
import { SsePublisher } from './sse.publisher';

import { MicroservicesModule } from '@/modules/messaging';
import { AccessControlModule } from '@/modules/security';

const SSE_MODULE_OPTIONS = Symbol('SSE_MODULE_OPTIONS');

@Module({})
export class SseModule {
  constructor(@Optional() @Inject(SSE_MODULE_OPTIONS) readonly options: Record<string, unknown>) {
    if (!options) {
      throw new Error(
        `🚨 SseModule은 직접 import 할 수 없습니다. 
        SseModule.forServer() 또는 SseModule.forPublisher()를 사용해주세요.`,
      );
    }
  }

  /**
   * [API 서버용]
   * - SSE 연결을 맺고(Controller)
   * - 연결을 관리하며(ConnectionService)
   * - 이벤트를 수신하여 클라이언트에 쏩니다(Listener)
   * - 물론 이벤트를 발행할 수도 있습니다(Publisher)
   */
  static forServer(): DynamicModule {
    return {
      module: SseModule,
      imports: [AccessControlModule, MicroservicesModule],
      providers: [
        SseConnectionService,
        SsePublisher,
        {
          provide: SSE_MODULE_OPTIONS,
          useValue: {},
        },
      ],
      controllers: [SseHttpController, SseEventController],
      exports: [SseConnectionService, SsePublisher],
    };
  }

  /**
   * [Worker/Batch 서버용]
   * - HTTP 연결 기능 없음
   * - 오직 이벤트를 브로커에 발행하는 기능(Publisher)만 제공
   */
  static forPublisher(): DynamicModule {
    return {
      module: SseModule,
      imports: [MicroservicesModule],
      controllers: [],
      providers: [
        SsePublisher,
        {
          provide: SSE_MODULE_OPTIONS,
          useValue: {},
        },
      ],
      exports: [SsePublisher],
    };
  }
}
