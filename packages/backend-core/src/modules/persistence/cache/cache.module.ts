import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { Keyv } from 'keyv';

import { CacheService } from './cache.service';

import { RedisConfig, redisConfig } from '@/modules/foundation/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [redisConfig.KEY],
      useFactory: async (config: RedisConfig) => {
        const redisUrl = `redis://${config.redisHost}`;
        const prefix = config.cachePrefix;
        const defaultTtlMs = config.cacheDefaultTtlMs;

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
