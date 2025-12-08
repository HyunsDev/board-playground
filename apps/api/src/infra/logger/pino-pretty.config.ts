/* eslint-disable functional/no-expression-statements */

import { DestinationStream } from 'pino';

import { BaseDomainEvent, DomainError } from '@/shared/base';

export const createDevLoggerStream = async (): Promise<DestinationStream> => {
  const { build } = await import('pino-pretty');
  const chalk = (await import('chalk')).default;

  // --- Helpers ---
  const formatId = (id: string) => (id ? chalk.gray(`[${id.slice(-7)}]`) : '');
  const formatDuration = (ms: any) => (ms ? chalk.gray(`+${ms}ms`) : '');
  const isDomainError = (err: unknown): err is DomainError =>
    err && typeof err === 'object' && 'code' in err;

  return build({
    colorize: true,
    singleLine: true,
    translateTime: 'SYS:HH:MM:ss',
    ignore:
      'pid,hostname,req,res,responseTime,context,reqId,userId,sessionId,httpMethod,reqUrl,resStatus,duration,err,errorCode,event',

    messageFormat: (log, messageKey) => {
      const msg = log[messageKey] as string;
      const context = log.context ? chalk.yellow(`[${log.context}]`) : '';
      const reqId = formatId(log.reqId as string);

      if (log.event) {
        const event = log.event as BaseDomainEvent;

        const ctxText = chalk.gray('EVENT'.padStart(6));
        const eventName = chalk.blue(msg);
        return `${reqId} ${ctxText} ${eventName}(${event.code})`;
      }

      // Case 1: CQRS Command/Query Bus Log
      if (log.duration) {
        const duration = formatDuration(log.duration);
        const err = log.err as DomainError | Error | undefined;
        const ctxText =
          log.context === 'CommandBus'
            ? chalk.gray('CMD'.padStart(6))
            : log.context === 'QueryBus'
              ? chalk.gray('QUERY'.padStart(6))
              : '';

        if (err) {
          const symbol = chalk.red('(ERR)');
          const cmdName = chalk.red(msg);
          let errorCode = '';

          if (isDomainError(err)) {
            errorCode = chalk.gray(`[${err.code}]`);
          } else if (err instanceof Error) {
            errorCode = chalk.gray(`[${err.name || 'Error'}]`);
          }
          return `${reqId} ${ctxText} ${cmdName} ${symbol} ${errorCode} ${duration}`;
        }

        const symbol = chalk.green('(OK)');
        const cmdName = chalk.green(msg);
        return `${reqId} ${ctxText} ${cmdName} ${symbol} ${duration}`;
      }

      // Case 2: HTTP Request Log
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
