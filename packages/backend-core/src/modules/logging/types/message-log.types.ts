import { DomainError } from '@workspace/backend-ddd';
import { CommandCode, DomainEventCode, QueryCode } from '@workspace/domain';

import { BaseLogData } from './base-log.types';
import { LogTypeEnum } from '../log.enums';

import { MessageMetadata } from '@/base';

export type ResultType = 'Success' | 'DomainError' | 'SystemException' | 'UnexpectedException';
export type BaseMessageLogData = BaseLogData & MessageMetadata;

type MessageSuccessResult = {
  duration: string;
  result: 'Success';
};
type MessageDomainErrorResult = {
  duration: string;
  result: 'DomainError';
  error: DomainError;
};
type MessageSystemExceptionResult = {
  duration: string;
  result: 'SystemException';
  error: Error;
};
type MessageUnexpectedExceptionResult = {
  duration: string;
  result: 'UnexpectedException';
  error: unknown;
};

type MessageResult =
  | MessageSuccessResult
  | MessageDomainErrorResult
  | MessageSystemExceptionResult
  | MessageUnexpectedExceptionResult;

export type CommandLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Command'];
    code: CommandCode;
  };

export type QueryLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Query'];
    code: QueryCode;
    queryData: unknown;
  };

export type EventLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Event'];
    code: DomainEventCode;
    handlerName: string;
  };

export type EventPublishedLogData = BaseMessageLogData & {
  type: LogTypeEnum['EventPublished'];
  code: DomainEventCode;
};

export type JobLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Job'];
    code: string;
  };

export type RpcLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Rpc'];
    code: string;
    handlerName: string;
  };

export type IntegrationEventLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['IntegrationEvent'];
    code: string;
    handlerName: string;
  };
export type MessageResultLogData =
  | CommandLogData
  | QueryLogData
  | EventLogData
  | JobLogData
  | RpcLogData
  | IntegrationEventLogData;

export type MessageLogData =
  | CommandLogData
  | QueryLogData
  | EventLogData
  | EventPublishedLogData
  | JobLogData
  | RpcLogData
  | IntegrationEventLogData;
