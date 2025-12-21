import chalk from 'chalk';

import { DomainError } from '@workspace/backend-ddd';

import { formatReqId, formatDuration } from './formatter.utils';
import {
  CommandLogData,
  EventLogData,
  EventPublishedLogData,
  IntegrationEventLogData,
  JobLogData,
  QueryLogData,
  RpcLogData,
} from '../types';

const MessageTypeMap = {
  COMMAND: 'CMD',
  QUERY: 'QUERY',
  EVENT: 'EVENT',
  EVENT_PUBLISHED: 'EVENT',
  JOB: 'JOB',
  RPC: 'RPC',
  INTEGRATION_EVENT: 'PUB',
} as const;

export const formatCommandAndQueryResultLog = (log: CommandLogData | QueryLogData): string => {
  const reqId = formatReqId(log.reqId);
  const duration = formatDuration(log.duration);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));

  if (log.result === 'DomainError') {
    const symbol = chalk.yellow('✕');
    const messageCode = chalk.yellow(log.code);
    const errorCode = chalk.gray(`[${log.error.code}]`);
    return `${reqId} ${type} ${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  if (log.result !== 'Success') {
    const symbol = chalk.red('✕');
    const messageCode = chalk.red(log.code);
    const errorCode = chalk.gray(
      `[${log.error instanceof DomainError ? log.error.code : 'Error'}]`,
    );
    return `${reqId} ${type} ${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  const symbol = chalk.green('✓');
  const messageCode = chalk.green(log.code);
  return `${reqId} ${type} ${messageCode} ${symbol} ${duration}`;
};

export const formatEventResultLog = (log: EventLogData): string => {
  const reqId = formatReqId(log.reqId);
  const duration = formatDuration(log.duration);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));

  if (log.result !== 'Success') {
    const symbol = chalk.red('✕');
    const messageCode = chalk.gray(`(${log.code})`);
    const handlerName = chalk.red(log.handlerName);
    const errorCode = chalk.gray(
      `[${log.error instanceof DomainError ? log.error.code : 'Error'}]`,
    );
    return `${reqId} ${type} ${handlerName}${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  const symbol = chalk.green('✓');
  const messageCode = chalk.gray(`(${log.code})`);
  const handlerName = chalk.green(log.handlerName);
  return `${reqId} ${type} ${handlerName}${messageCode} ${symbol} ${duration}`;
};

export const formatEventPublishedLog = (log: EventPublishedLogData): string => {
  const reqId = formatReqId(log.reqId);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));
  const messageCode = chalk.blue(log.code);
  const symbol = chalk.blue('→');
  return `${reqId} ${type} ${messageCode} ${symbol}`;
};

export const formatJobResultLog = (log: JobLogData): string => {
  const reqId = formatReqId(log.reqId);
  const duration = formatDuration(log.duration);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));

  if (log.result !== 'Success') {
    const symbol = chalk.red('✕');
    const messageCode = chalk.red(log.code);
    const errorCode = chalk.gray(
      `[${log.error instanceof DomainError ? log.error.code : 'Error'}]`,
    );
    return `${reqId} ${type} ${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  const symbol = chalk.green('✓');
  const messageCode = chalk.green(log.code);
  return `${reqId} ${type} ${messageCode} ${symbol} ${duration}`;
};

export const formatRpcResultLog = (log: RpcLogData): string => {
  const reqId = formatReqId(log.reqId);
  const duration = formatDuration(log.duration);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));

  if (log.result === 'DomainError') {
    const symbol = chalk.yellow('✕');
    const messageCode = chalk.yellow(log.code);
    const errorCode = chalk.gray(`[${log.error.code}]`);
    return `${reqId} ${type} ${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  if (log.result !== 'Success') {
    const symbol = chalk.red('✕');
    const messageCode = chalk.red(log.code);
    const errorCode = chalk.gray(
      `[${log.error instanceof DomainError ? log.error.code : 'Error'}]`,
    );
    return `${reqId} ${type} ${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  const symbol = chalk.green('✓');
  const messageCode = chalk.green(log.code);
  return `${reqId} ${type} ${messageCode} ${symbol} ${duration}`;
};

export const formatIntegrationEventResultLog = (log: IntegrationEventLogData): string => {
  const reqId = formatReqId(log.reqId);
  const duration = formatDuration(log.duration);
  const type = chalk.gray(MessageTypeMap[log.type].padStart(6));

  if (log.result !== 'Success') {
    const symbol = chalk.red('✕');
    const messageCode = chalk.gray(`(${log.code})`);
    const handlerName = chalk.red(log.handlerName);
    const errorCode = chalk.gray(
      `[${log.error instanceof DomainError ? log.error.code : 'Error'}]`,
    );
    return `${reqId} ${type} ${handlerName}${messageCode} ${symbol} ${errorCode} ${duration}`;
  }

  const symbol = chalk.green('✓');
  const messageCode = chalk.gray(`(${log.code})`);
  const handlerName = chalk.green(log.handlerName);
  return `${reqId} ${type} ${handlerName}${messageCode} ${symbol} ${duration}`;
};
