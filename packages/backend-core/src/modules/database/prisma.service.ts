import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@workspace/database';

import { prismaConfig, PrismaConfig } from '../config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(prismaConfig.KEY)
    readonly prismaConfig: PrismaConfig,
  ) {
    super({
      datasources: {
        db: {
          url: prismaConfig.databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
