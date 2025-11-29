import { Injectable } from '@nestjs/common';

import { DomainEventDispatcher } from './domain-event.dispatcher';
import { PrismaService } from './prisma.service';
import { ClsAccessor } from '../cls';

@Injectable()
export class TransactionManager {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.prisma.$transaction(async (tx) => {
      ClsAccessor.setTransactionClient(tx);
      try {
        const res = await operation();
        return res;
      } catch (error) {
        this.eventDispatcher.clear();
        throw error; // 롤백 트리거
      } finally {
        ClsAccessor.clearTransactionClient();
      }
    });

    await this.eventDispatcher.dispatchAll();

    return result;
  }
}
