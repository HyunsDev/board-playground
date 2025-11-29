import { Injectable } from '@nestjs/common';

import { DomainEventDispatcher } from './domain-event.dispatcher';
import { PrismaService } from './prisma.service';
import { ContextService } from '../context/context.service';

@Injectable()
export class TransactionManager {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ContextService,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.prisma.$transaction(async (tx) => {
      this.context.setTx(tx);
      try {
        const res = await operation();
        return res;
      } catch (error) {
        this.eventDispatcher.clear();
        throw error; // 롤백 트리거
      } finally {
        this.context.clearTx();
      }
    });

    await this.eventDispatcher.dispatchAll();
    return result;
  }
}
