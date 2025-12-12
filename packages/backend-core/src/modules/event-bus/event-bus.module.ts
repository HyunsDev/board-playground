import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DomainEventPublisher } from '@workspace/backend-ddd';

import { NestJSDomainEventPublisher } from './domain-event.publisher';

import { CoreContextModule } from '@/modules/context/context.module';

@Global()
@Module({
  imports: [CqrsModule, CoreContextModule],
  providers: [
    {
      provide: DomainEventPublisher,
      useClass: NestJSDomainEventPublisher,
    },
  ],
  exports: [DomainEventPublisher],
})
export class EventBusModule {}
