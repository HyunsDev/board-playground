import { IncomingMessage, ServerResponse } from 'http';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';

import { CqrsLoggerService } from './cqrs-logger.service';
import { ContextModule } from '../context/context.module';
import { ContextService } from '../context/context.service';

@Module({
  imports: [
    CqrsModule,
    LoggerModule.forRootAsync({
      imports: [ConfigModule, ContextModule],
      inject: [ConfigService, ContextService],
      useFactory: async (configService: ConfigService, contextService: ContextService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        // --------------------------------------------------------------------
        // [개발 환경용] Custom Stream 생성 (Main Thread 실행)
        // --------------------------------------------------------------------
        let devStream: any;
        if (!isProduction) {
          // 동적 import로 프로덕션 빌드 크기 최적화
          const { build } = await import('pino-pretty');
          const chalk = (await import('chalk')).default; // chalk v4

          const formatStatusCode = (status: number): string => {
            if (status >= 500) return chalk.red(status.toString());
            if (status >= 400) return chalk.yellow(status.toString());
            if (status >= 300) return chalk.cyan(status.toString());
            if (status >= 200) return chalk.green(status.toString());
            return chalk.white(status.toString());
          };

          const formatMethod = (method: string): string => {
            const text = method.toString().padStart(5, ' ');
            if (['GET'].includes(method)) return chalk.greenBright(text);
            if (['POST'].includes(method)) return chalk.cyanBright(text);
            if (['PUT', 'PATCH'].includes(method)) return chalk.yellowBright(text);
            if (['DELETE'].includes(method)) return chalk.redBright(text);
            return chalk.white(text);
          };

          // eslint-disable-next-line functional/no-expression-statements
          devStream = build({
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore:
              'pid,hostname,context,req,res,responseTime,httpMethod,reqUrl,resStatus,userId,sessionId,reqId,errorCode',

            messageFormat: (log, messageKey) => {
              const msg = chalk.green(log[messageKey]);
              const context = log.context ? chalk.yellow(`[${log.context}] `) : '';

              // 1. 일반 시스템 로그 (HTTP 메서드가 없는 경우)
              if (!log.httpMethod) {
                return `${context}${msg}`;
              }

              const reqId = log.reqId as string;
              const fmtReqId = chalk.gray(reqId ? `${reqId.split('-')[4].slice(0, 7)} ` : '');

              // 2. 처리 로그
              if (!log.responseTime) {
                return `${fmtReqId}${context}${msg}`;
              }

              const method = log.httpMethod as string;
              const fmtMethod = formatMethod(method) + ' ';

              const url = log.reqUrl as string;
              const fmtUrl = chalk.white(url) + ' ';

              const status = log.resStatus as number;
              const fmtStatus = formatStatusCode(status) + ' ';

              const time = log.responseTime;
              const fmtTime = chalk.gray(`+${time}ms`) + ' ';

              const userId = log.userId !== 'guest' ? (log.userId as string) : '';
              const fmtUserId = userId ? chalk.magenta(` ${userId.split('-')[4].slice(0, 7)}`) : '';

              const errorCode = log.errorCode ? (log.errorCode as string) : undefined;
              const fmtErrorCode = errorCode ? chalk.red(`[${errorCode}] `) : '';

              // 3. HTTP 요청 로그
              return `${fmtReqId}${context}${fmtMethod}${fmtUrl}${fmtStatus}${fmtErrorCode}${fmtTime}${fmtUserId}`;
            },
          });
        }

        // --------------------------------------------------------------------
        // [공통] PinoHttp 설정
        // --------------------------------------------------------------------
        return {
          pinoHttp: {
            // 개발환경: Stream 사용 / 배포환경: Transport(File or Stdout) 사용
            stream: isProduction ? undefined : devStream,
            transport: isProduction ? undefined : undefined,

            genReqId: (req) =>
              contextService.getRequestId() || req.headers['x-request-id'] || 'unknown',

            customProps: (req: IncomingMessage, res: ServerResponse) => {
              const userId = contextService?.getUserId();
              const sessionId = contextService?.getToken()?.sessionId;
              const errorCode = contextService?.getErrorCode();

              // 공통 데이터 (프로덕션 JSON 로그에도 포함됨)
              const baseProps = {
                userId: userId ?? 'guest',
                sessionId: sessionId ?? 'no-session',
                errorCode: errorCode ?? undefined,
              };

              // 개발 환경이면 포맷팅을 위한 추가 메타데이터 주입
              if (!isProduction) {
                return {
                  ...baseProps,
                  reqId: contextService.getRequestId(),
                  httpMethod: req.method,
                  reqUrl: req.url,
                  resStatus: res.statusCode,
                };
              }

              return baseProps;
            },
            redact: ['req.headers.authorization', 'req.body.password'],
            level: isProduction ? 'info' : 'debug',
            autoLogging: {
              ignore: (req) => req.url === '/health' || req.url === '/api/health',
            },
          },
        };
      },
    }),
  ],
  providers: [CqrsLoggerService],
})
export class CoreLoggerModule {}
