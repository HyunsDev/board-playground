import { DynamicModule, Inject, Module, Optional } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { MailProcessor } from './mail.processor';
import { MailPublisher } from './mail.publisher';
import { MailerService } from './mailer.service';
import { SendMailJobHandler } from './send-mail.job';

import { TaskQueueModule } from '@/modules/messaging';

const MAILER_MODULE_OPTIONS = Symbol('MAILER_MODULE_OPTIONS');

@Module({})
export class MailerModule {
  constructor(
    @Optional() @Inject(MAILER_MODULE_OPTIONS) readonly options: Record<string, unknown>,
  ) {
    if (!options) {
      throw new Error(
        `🚨 ${MailerModule.name} 직접 import 할 수 없습니다. 
            MailerModule.forSend() 또는 MailerModule.forFeature()를 사용해주세요.`,
      );
    }
  }

  static forSend(): DynamicModule {
    return {
      module: MailerModule,
      imports: [
        TaskQueueModule.forFeature({
          queue: {
            name: TaskQueueCodeEnum.System.Mail,
          },
        }),
      ],
      providers: [
        {
          provide: MAILER_MODULE_OPTIONS,
          useValue: {},
        },
        MailerService,
        SendMailJobHandler,
        MailProcessor,
      ],
      exports: [],
      controllers: [],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: MailerModule,
      imports: [
        TaskQueueModule.forFeature({
          queue: {
            name: TaskQueueCodeEnum.System.Mail,
          },
        }),
      ],
      providers: [
        {
          provide: MAILER_MODULE_OPTIONS,
          useValue: {},
        },
        MailPublisher,
      ],
      exports: [MailPublisher],
      controllers: [],
    };
  }
}
