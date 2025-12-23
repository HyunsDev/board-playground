import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';
import { multistream, transport } from 'pino'; // [수정] pino 유틸리티 import

import { getCommonPinoConfig } from './config/pino-common.config';
import { createDevLoggerStream } from './config/pino-pretty.config';
import { EventPublishInstrumentation } from './instrumentations/event-publish.instrumentation';

import { CoreConfig, coreConfig } from '@/modules/foundation/config';
import { CoreContext, TokenContext } from '@/modules/foundation/context';

@Module({
  imports: [
    CqrsModule,
    DiscoveryModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [coreConfig.KEY, CoreContext, TokenContext],
      useFactory: async (
        coreConfig: CoreConfig,
        coreContext: CoreContext,
        tokenContext: TokenContext,
      ) => {
        const isProduction = coreConfig.nodeEnv === 'production';
        const { useLocalLoki } = coreConfig;

        const commonConfig = getCommonPinoConfig(isProduction, coreContext, tokenContext);

        // 1. [Production] 표준 출력 (JSON) - Promtail이 수집하도록 둠
        if (isProduction) {
          // stream을 지정하지 않으면 기본적으로 process.stdout (JSON) 사용
          return { pinoHttp: commonConfig };
        }

        // 2. [Development] 개발 환경 설정 (Pretty Console + Optional Loki)
        const streams: { stream: any }[] = [];

        // 2-1. 기존 Pretty Logger Stream (콘솔용)
        const devStream = await createDevLoggerStream();
        streams.push({ stream: devStream });

        // 2-2. Loki Stream (Loki 컨테이너로 전송)
        if (useLocalLoki) {
          const lokiStream = transport({
            target: 'pino-loki',
            options: {
              batching: true, // 성능을 위해 배치 전송
              interval: 5, // 5초마다 전송
              host: 'http://localhost:3100', // Docker Compose의 Loki 주소 (로컬 호스트 기준)
              labels: { application: 'board-playground-local' }, // Loki에서 식별할 레이블
              // 필요 시 basicAuth: { username: "...", password: "..." } 추가
            },
          });
          streams.push({ stream: lokiStream });
        }

        return {
          pinoHttp: {
            ...commonConfig,
            // [핵심] 여러 스트림을 하나로 합쳐서 전달
            stream: multistream(streams),
          },
        };
      },
    }),
  ],
  providers: [EventPublishInstrumentation],
  exports: [LoggerModule],
})
export class LoggingModule {}
