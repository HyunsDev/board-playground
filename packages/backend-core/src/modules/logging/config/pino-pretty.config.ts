/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DestinationStream } from 'pino';

import { formatDomainLog, formatGeneralLog } from '../formatters/general.formatter';
import { formatHttpLog } from '../formatters/http.formatter';
import {
  formatCommandAndQueryResultLog,
  formatEventPublishedLog,
  formatEventResultLog,
  formatJobResultLog,
} from '../formatters/message.formatter';
import {
  isCommandLog,
  isDomainLog,
  isEventLog,
  isEventPublishedLog,
  isHttpLog,
  isJobLog,
  isQueryLog,
} from '../logging.predicates';

export const createDevLoggerStream = async (): Promise<DestinationStream> => {
  const { build } = await import('pino-pretty');
  const chalk = (await import('chalk')).default;

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
        const label =
          typeof logLevel === 'number'
            ? levelLabels[logLevel] || 'UNKNOWN'
            : (logLevel as string).toUpperCase();

        const paddedLabel = label.padStart(5);

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
      'pid,hostname,req,res,responseTime,context,reqId,userId,sessionId,httpMethod,reqUrl,resStatus,duration,errorCode,event,type,action,isError,correlationId,causationId,causationType,createdAt,queryData,error,handlerName,resourceId,resourceType,code,result',

    messageFormat: (log: any) => {
      if (isCommandLog(log)) {
        return formatCommandAndQueryResultLog(log);
      }

      if (isQueryLog(log)) {
        return formatCommandAndQueryResultLog(log);
      }

      if (isEventLog(log)) {
        return formatEventResultLog(log);
      }

      if (isEventPublishedLog(log)) {
        return formatEventPublishedLog(log);
      }

      if (isJobLog(log)) {
        return formatJobResultLog(log);
      }

      if (isDomainLog(log)) {
        return formatDomainLog(log);
      }

      if (isHttpLog(log)) {
        return formatHttpLog(log);
      }

      return formatGeneralLog(log);
    },
  });
};
