/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators } from '@nestjs/common';
import { EventsHandler as NestEventHandler } from '@nestjs/cqrs';

import { BaseDomainEvent } from '@/base';

export const DomainEventHandler = (...events: (typeof BaseDomainEvent<any>)[]) => {
  return applyDecorators(NestEventHandler(events));
};
