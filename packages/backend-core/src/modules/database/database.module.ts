import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global() // Database/Transaction은 전역에서 쓰이는 경우가 많음
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
