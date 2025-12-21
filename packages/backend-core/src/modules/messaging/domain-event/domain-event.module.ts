import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { DomainEventPublisher } from './domain-event.publisher';

import { DomainEventPublisherPort } from '@/base';
import { CoreContextModule } from '@/modules/foundation/context/context.module';

@Global()
@Module({
  imports: [CqrsModule, CoreContextModule],
  providers: [
    {
      provide: DomainEventPublisherPort,
      useClass: DomainEventPublisher,
    },
  ],
  exports: [DomainEventPublisherPort],
})
export class DomainEventModule {}
