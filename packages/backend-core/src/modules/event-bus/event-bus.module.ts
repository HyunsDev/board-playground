import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DomainEventPublisherPort } from '@workspace/backend-ddd';

import { NestJSDomainEventPublisher } from './domain-event.publisher';

import { CoreContextModule } from '@/modules/context/context.module';

@Global()
@Module({
  imports: [CqrsModule, CoreContextModule],
  providers: [
    {
      provide: DomainEventPublisherPort,
      useClass: NestJSDomainEventPublisher,
    },
  ],
  exports: [DomainEventPublisherPort],
})
export class EventBusModule {}
