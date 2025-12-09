import { Module } from '@nestjs/common';

import { DomainEventDispatcher } from './domain-event.dispatcher';
import { PrismaService } from './prisma.service';
import { TransactionManager } from './transaction.manager';

@Module({
  providers: [PrismaService, TransactionManager, DomainEventDispatcher],
  exports: [PrismaService, TransactionManager, DomainEventDispatcher],
})
export class PrismaModule {}
