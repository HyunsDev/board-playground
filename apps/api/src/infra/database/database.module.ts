import { Global, Module } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { DomainEventDispatcher } from './domain-event.dispatcher';
import { TransactionResultInterceptor } from './interceptor/transaction-result.interceptor';
import { TransactionManager } from './transaction.manager';

@Global()
@Module({
  providers: [
    DatabaseService,
    TransactionManager,
    DomainEventDispatcher,
    TransactionResultInterceptor,
  ],
  exports: [
    DatabaseService,
    TransactionManager,
    DomainEventDispatcher,
    TransactionResultInterceptor,
  ],
})
export class DatabaseModule {}
