/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DestinationStream } from 'pino';

import { LogTypes } from '../log.types';
import {
  isEventPublishedLogData,
  isCommandHandlerLogData,
  isQueryHandlerLogData,
  isDomainError,
  isEventHandlerLogData,
} from '../logging.utils';

export const createDevLoggerStream = async (): Promise<DestinationStream> => {
  const { build } = await import('pino-pretty');
  const chalk = (await import('chalk')).default;

  // --- Helpers ---
  const formatId = (id: string) => (id ? chalk.gray(`[${id.slice(-7)}]`) : '');
  const formatDuration = (ms: any) => (ms ? chalk.gray(`+${ms}ms`) : '');

  // [추가] 레벨 매핑 (Pino는 기본적으로 레벨을 숫자로 전달함)
  const levelLabels: Record<number, string> = {
    10: 'TRACE',
    20: 'DEBUG',
    30: 'INFO',
    40: 'WARN',
    50: 'ERROR',
    60: 'FATAL',
  };

  return build({
    colorize: true,
    singleLine: true,
    translateTime: 'SYS:HH:MM:ss',
    customPrettifiers: {
      level: (logLevel: any) => {
        // 1. 레벨 숫자를 문자열로 변환 (혹은 이미 문자열이면 대문자로)
        const label =
          typeof logLevel === 'number'
            ? levelLabels[logLevel] || 'UNKNOWN'
            : (logLevel as string).toUpperCase();

        // 2. 5글자로 Left Padding (DEBUG가 5글자이므로 이에 맞춤)
        // "INFO" -> " INFO"
        const paddedLabel = label.padStart(5);

        // 3. 색상 적용 (기존 pino-pretty 색상 테마 흉내)
        switch (label) {
          case 'INFO':
            return chalk.green(paddedLabel);
          case 'DEBUG':
            return chalk.blue(paddedLabel);
          case 'WARN':
            return chalk.yellow(paddedLabel);
          case 'ERROR':
            return chalk.red(paddedLabel);
          case 'FATAL':
            return chalk.redBright(paddedLabel);
          default:
            return chalk.white(paddedLabel);
        }
      },
    },
    ignore:
      'pid,hostname,req,res,responseTime,context,reqId,userId,sessionId,httpMethod,reqUrl,resStatus,duration,errorCode,event,type,action,isError,correlationId,causationId,causationType,createdAt,queryData,error,handlerName,resourceId,resourceType',

    messageFormat: (log: any, messageKey: string) => {
      const msg = log[messageKey] as string;
      const context = log.context ? chalk.yellow(`[${log.context}]`) : '';
      const reqId = formatId(log.reqId as string);

      // CQRS Event Bus Log
      if (isEventPublishedLogData(log)) {
        const msgType = chalk.gray('EVENT'.padStart(6));
        const eventName = chalk.blue(msg);
        return `${reqId} ${msgType} ${eventName}(${log.action})`;
      }

      // CQRS Command/Query Bus Log
      if (isCommandHandlerLogData(log) || isQueryHandlerLogData(log)) {
        const duration = formatDuration(log.duration);
        const error = log.isError ? log.error : undefined;
        const msgType = chalk.gray(
          {
            [LogTypes.CommandHandled]: 'CMD',
            [LogTypes.QueryHandled]: 'QUERY',
            [LogTypes.EventHandled]: 'EVENT',
          }[log.type]!.padStart(6),
        );

        if (error) {
          const symbol = chalk.red('✕');
          const cmdName = chalk.red(msg);
          let errorCode = '';

          if (isDomainError(error)) {
            errorCode = chalk.gray(`[${error.code}]`);
          } else if (error instanceof Error) {
            errorCode = chalk.gray(`[${error.name || 'Error'}]`);
          }
          return `${reqId} ${msgType} ${cmdName} ${symbol} ${errorCode} ${duration}`;
        }

        const symbol = chalk.green('✓');
        const cmdName = chalk.green(msg);
        return `${reqId} ${msgType} ${cmdName} ${symbol} ${duration}`;
      }

      if (isEventHandlerLogData(log)) {
        const duration = formatDuration(log.duration);
        const error = log.isError ? log.error : undefined;
        const msgType = chalk.gray(
          {
            [LogTypes.CommandHandled]: 'CMD',
            [LogTypes.QueryHandled]: 'QUERY',
            [LogTypes.EventHandled]: 'EVENT',
          }[log.type]!.padStart(6),
        );

        if (error) {
          const symbol = chalk.red('✕');
          const cmdName = chalk.gray(`(${msg})`);
          const handlerName = chalk.red(log.handlerName);
          let errorCode = '';

          if (isDomainError(error)) {
            errorCode = chalk.gray(`[${error.code}]`);
          } else if (error instanceof Error) {
            errorCode = chalk.gray(`[${error.name || 'Error'}]`);
          }
          return `${reqId} ${msgType} ${handlerName}${cmdName} ${symbol} ${errorCode} ${duration}`;
        }

        const symbol = chalk.green('✓');
        const cmdName = chalk.gray(`(${msg})`);
        const handlerName = chalk.green(log.handlerName);
        return `${reqId} ${msgType} ${handlerName}${cmdName} ${symbol} ${duration}`;
      }

      // HTTP Request Log
      if (log.httpMethod && log.responseTime) {
        const methodRaw = (log.httpMethod as string).padStart(6, ' ');
        let methodColor = chalk.white;
        const m = methodRaw.trim();
        if (m === 'GET') methodColor = chalk.greenBright;
        else if (m === 'POST') methodColor = chalk.cyanBright;
        else if (m === 'PUT' || m === 'PATCH') methodColor = chalk.yellowBright;
        else if (m === 'DELETE') methodColor = chalk.redBright;

        const url = chalk.white(log.reqUrl);
        const status = log.resStatus as number;
        let statusColor = chalk.white;
        if (status >= 500) statusColor = chalk.red;
        else if (status >= 400) statusColor = chalk.yellow;
        else if (status >= 200) statusColor = chalk.green;

        const duration = formatDuration(log.responseTime);
        const errorCode = log.errorCode ? chalk.gray(`[${log.errorCode}]`) : '';
        const userIdRaw = log.userId as string;
        const userId =
          userIdRaw && userIdRaw !== 'guest' ? chalk.magenta(`@${userIdRaw.slice(-7)}`) : '';

        return `${reqId} ${methodColor(methodRaw)} ${url} ${statusColor(status)} ${errorCode} ${duration} ${userId}`;
      }

      // Case 3: General Log
      return `${reqId} ${context} ${msg}`;
    },
  });
};
