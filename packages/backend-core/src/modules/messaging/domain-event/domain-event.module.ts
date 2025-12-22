import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DomainEventPublisher } from './domain-event.publisher';

import { DomainEventPublisherPort } from '@/base';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: DomainEventPublisherPort,
      useClass: DomainEventPublisher,
    },
  ],
  exports: [DomainEventPublisherPort],
})
export class DomainEventModule {}
