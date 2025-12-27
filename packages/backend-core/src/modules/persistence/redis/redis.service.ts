import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

import { redisConfig, RedisConfig } from '@/modules/foundation/config';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(redisConfig.KEY) config: RedisConfig) {
    const options: RedisOptions = {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
      lazyConnect: true,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    };

    super(options);
  }

  async onModuleInit() {
    this.registerEventListeners();
    await this.connect();
  }

  async onModuleDestroy() {
    await this.quit();
  }

  private registerEventListeners() {
    this.on('connect', () => {
      this.logger.log(`Redis connected to ${this.options.host}:${this.options.port}`);
    });

    this.on('error', (err) => {
      this.logger.error(`Redis Error: ${err.message}`, err.stack);
    });

    this.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });
  }
}
