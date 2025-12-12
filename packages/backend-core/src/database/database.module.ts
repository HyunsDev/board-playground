import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { TransactionManager } from './transaction.manager';

@Global() // Database/Transaction은 전역에서 쓰이는 경우가 많음
@Module({
  providers: [PrismaService, TransactionManager],
  exports: [PrismaService, TransactionManager],
})
export class DatabaseModule {}
