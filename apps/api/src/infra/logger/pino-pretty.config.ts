/* eslint-disable functional/no-expression-statements */

import { DestinationStream } from 'pino';

import {
  CommandHandledLogData,
  EventHandledLogData,
  EventPublishedLogData,
  LogTypes,
  QueryHandledLogData,
} from './logger.types';

import { DomainError } from '@/shared/base';

const isCommandHandlerLogData = (a: Record<string, any>): a is CommandHandledLogData => {
  return a.type === LogTypes.CommandHandled;
};
const isQueryHandlerLogData = (a: Record<string, any>): a is QueryHandledLogData => {
  return a.type === LogTypes.QueryHandled;
};
const isEventHandlerLogData = (a: Record<string, any>): a is EventHandledLogData => {
  return a.type === LogTypes.EventHandled;
};
const isEventPublishedLogData = (a: Record<string, any>): a is EventPublishedLogData => {
  return a.type === LogTypes.EventPublished;
};
const isDomainError = (err: DomainError | Error): err is DomainError =>
  err && typeof err === 'object' && 'code' in err;

export const createDevLoggerStream = async (): Promise<DestinationStream> => {
  const { build } = await import('pino-pretty');
  const chalk = (await import('chalk')).default;

  // --- Helpers ---
  const formatId = (id: string) => (id ? chalk.gray(`[${id.slice(-7)}]`) : '');
  const formatDuration = (ms: any) => (ms ? chalk.gray(`+${ms}ms`) : '');

  return build({
    colorize: true,
    singleLine: true,
    translateTime: 'SYS:HH:MM:ss',
    ignore:
      'pid,hostname,req,res,responseTime,context,reqId,userId,sessionId,httpMethod,reqUrl,resStatus,duration,errorCode,event,type,action,isError,correlationId,causationId,causationType,createdAt,queryData,error',

    messageFormat: (log, messageKey) => {
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
      if (
        isCommandHandlerLogData(log) ||
        isQueryHandlerLogData(log) ||
        isEventHandlerLogData(log)
      ) {
        const duration = formatDuration(log.duration);
        const error = log.isError ? log.error : undefined;
        const msgType = chalk.gray(
          {
            [LogTypes.CommandHandled]: 'CMD',
            [LogTypes.QueryHandled]: 'QUERY',
            [LogTypes.EventHandled]: 'EVT',
          }[log.type]!.padStart(6),
        );

        if (error) {
          const symbol = chalk.red('(ERR)');
          const cmdName = chalk.red(msg);
          let errorCode = '';

          if (isDomainError(error)) {
            errorCode = chalk.gray(`[${error.code}]`);
          } else if (error instanceof Error) {
            errorCode = chalk.gray(`[${error.name || 'Error'}]`);
          }
          return `${reqId} ${msgType} ${cmdName} ${symbol} ${errorCode} ${duration}`;
        }

        const symbol = chalk.green('(OK)');
        const cmdName = chalk.green(msg);
        return `${reqId} ${msgType} ${cmdName} ${symbol} ${duration}`;
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
