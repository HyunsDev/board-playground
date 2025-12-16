import { DomainError } from '@workspace/backend-ddd';
import { CommandCode, EventCode, QueryCode } from '@workspace/domain';

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
    code: EventCode;
    handlerName: string;
  };

export type EventPublishedLogData = BaseMessageLogData & {
  type: LogTypeEnum['EventPublished'];
  code: EventCode;
};

export type JobLogData = BaseMessageLogData &
  MessageResult & {
    type: LogTypeEnum['Job'];
    code: string;
  };

export type MessageResultLogData = CommandLogData | QueryLogData | EventLogData | JobLogData;

export type MessageLogData =
  | CommandLogData
  | QueryLogData
  | EventLogData
  | EventPublishedLogData
  | JobLogData;
