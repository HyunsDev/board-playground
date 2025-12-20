/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators } from '@nestjs/common';
import { EventsHandler as NestEventHandler } from '@nestjs/cqrs';

import { MessageConstructor } from '@workspace/backend-ddd';

import { BaseDomainEvent } from '@/base';

export const DomainEventsHandler = (...events: MessageConstructor<BaseDomainEvent<any>>[]) => {
  return applyDecorators(NestEventHandler(events));
};
