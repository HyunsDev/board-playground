import { Global, Module } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { DomainEventDispatcher } from './domain-event.dispatcher';
import { TransactionManager } from './transaction.manager';

@Global()
@Module({
  providers: [DatabaseService, TransactionManager, DomainEventDispatcher],
  exports: [DatabaseService, TransactionManager, DomainEventDispatcher],
})
export class DatabaseModule {}
