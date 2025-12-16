import chalk from 'chalk';

import { formatReqId } from './formatter.utils';
import { BaseLogData } from '../types';
import { DomainLogData } from '../types/domain.log.types';

export const formatDomainLog = (log: DomainLogData): string => {
  const reqId = formatReqId(log.reqId);
  const context = log.context ? chalk.yellow(`[${log.context}]`) : '';
  const domain = chalk.gray(log.domain);
  const code = chalk.white(log.code);
  const message = chalk.blue(log.msg);

  return `${reqId} ${context} ${domain} ${code} ${message}`;
};

export const formatGeneralLog = (log: BaseLogData) => {
  const reqId = log.reqId ? formatReqId(log.reqId) + ' ' : '';
  const context = log.context ? chalk.yellow(`[${log.context}] `) : '';
  const message = chalk.blue(log.msg || '');

  return `${reqId}${context}${message}`;
};
