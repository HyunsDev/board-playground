import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@workspace/db';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    void (await this.$connect());
  }

  async onModuleDestroy() {
    void (await this.$disconnect());
  }
}
