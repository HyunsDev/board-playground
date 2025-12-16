import chalk from 'chalk';

import { formatDuration, formatReqId } from './formatter.utils';
import { HttpLogData } from '../types';

const formatMethod = (method: string): string => {
  const paddedMethod = method.padStart(6, ' ');
  switch (method) {
    case 'GET':
      return chalk.greenBright(paddedMethod);
    case 'POST':
      return chalk.cyanBright(paddedMethod);
    case 'PUT':
    case 'PATCH':
      return chalk.yellowBright(paddedMethod);
    case 'DELETE':
      return chalk.redBright(paddedMethod);
    default:
      return chalk.white(paddedMethod);
  }
};

export const formatHttpLog = (log: HttpLogData): string => {
  const method = log.httpMethod;

  let statusColor = chalk.white;
  if (log.resStatus >= 500) statusColor = chalk.red;
  else if (log.resStatus >= 400) statusColor = chalk.yellow;
  else if (log.resStatus >= 200) statusColor = chalk.green;

  const duration = formatDuration(log.responseTime);
  const user =
    log.userId && log.userId !== 'guest' ? chalk.magenta(`@${log.userId.slice(-7)}`) : '';
  const error = log.errorCode ? chalk.red(`[${log.errorCode}]`) : '';

  return `${formatReqId(log.reqId)} ${formatMethod(method)} ${chalk.white(log.reqUrl)} ${statusColor(
    log.resStatus,
  )} ${duration} ${user} ${error}`;
};
