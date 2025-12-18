import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { AppStore } from '../context.types';

import { DrivenMessageMetadata } from '@/base';
import { TriggerCode } from '@/common';

@Injectable()
export class MessageContext {
  constructor(private readonly cls: ClsService<AppStore>) {}

  setMetadata(metadata: DrivenMessageMetadata) {
    this.cls.set('messageMetadata', metadata);
  }

  createMetadata(initialTriggerCode: TriggerCode): DrivenMessageMetadata {
    return {
      causationId: this.cls.get('requestId') || null,
      causationType: initialTriggerCode,
      correlationId: this.cls.get('requestId') || null,
      userId: this.cls.get('token')?.sub || null,
    };
  }

  get drivenMetadata(): DrivenMessageMetadata | undefined {
    return this.cls.get('messageMetadata');
  }
}
