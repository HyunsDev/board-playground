import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AbstractDomainEventPublisherPort } from '@workspace/backend-ddd';

import { NestJSDomainEventPublisher } from './domain-event.publisher';

import { CoreContextModule } from '@/modules/context/context.module';

@Global()
@Module({
  imports: [CqrsModule, CoreContextModule],
  providers: [
    {
      provide: AbstractDomainEventPublisherPort,
      useClass: NestJSDomainEventPublisher,
    },
  ],
  exports: [AbstractDomainEventPublisherPort],
})
export class EventBusModule {}
