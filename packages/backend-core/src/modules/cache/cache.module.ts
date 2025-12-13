import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Keyv } from 'keyv';

import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const prefix = config.get<string>('CACHE_PREFIX') ?? 'app';
        const defaultTtlMs = Number(config.get<string>('CACHE_DEFAULT_TTL_MS') ?? '60000');

        const keyv = new Keyv({
          store: new KeyvRedis(redisUrl),
          namespace: prefix,
          ttl: defaultTtlMs,
        });

        return {
          stores: [keyv],
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
