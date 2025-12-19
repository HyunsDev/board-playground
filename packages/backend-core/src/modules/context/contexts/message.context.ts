import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { TriggerCode } from '@workspace/domain';

import { DrivenMessageMetadataNotFoundException } from '../context.exceptions';
import { AppStore } from '../context.types';

import { DrivenMessageMetadata } from '@/base';

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

  get drivenMetadata(): DrivenMessageMetadata {
    const metadata = this.cls.get('messageMetadata');
    if (!metadata) {
      throw new DrivenMessageMetadataNotFoundException();
    }
    return metadata;
  }
}
