import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { IntegrationEventPublisher } from './integration-event.publisher';
import { MESSAGING_SERVICE_TOKEN } from './microservices.constant';
import { RpcClient } from './rpc-client';
import { GlobalRpcExceptionFilter } from './rpc-exception.filter';

import { IntegrationEventPublisherPort } from '@/base';
import { RedisConfig, redisConfig } from '@/modules/foundation/config';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MESSAGING_SERVICE_TOKEN,
        inject: [redisConfig.KEY],
        useFactory: (redisConfig: RedisConfig) => {
          const host = redisConfig.redisHost;
          const port = redisConfig.redisPort;
          const password = redisConfig.redisPassword;

          return {
            transport: Transport.REDIS,
            options: {
              host,
              port,
              password,
              // Redis 큐 이름 설정 (이 이름을 구독하는 서버가 메시지를 받음)
              // MSA 환경에서 여러 서비스가 있다면 서비스별로 queue 이름을 분리하는 것이 좋습니다.
              // 예: queue: 'MAIN_API_QUEUE'
            },
          };
        },
      },
    ]),
  ],
  providers: [
    {
      provide: IntegrationEventPublisherPort,
      useClass: IntegrationEventPublisher,
    },
    RpcClient,
    GlobalRpcExceptionFilter,
  ],
  exports: [IntegrationEventPublisherPort, RpcClient],
})
export class MicroservicesModule {}
