import { AbstractMessageMetadata, DomainError } from '@workspace/backend-ddd';

export const LogTypes = {
  CommandHandled: 'CQRS_COMMAND_HANDLED',
  QueryHandled: 'CQRS_QUERY_HANDLED',
  EventHandled: 'CQRS_EVENT_HANDLED',
  EventPublished: 'CQRS_EVENT_PUBLISHED',
};
export type LogType = (typeof LogTypes)[keyof typeof LogTypes];

export type CommandHandledLogData = {
  type: typeof LogTypes.CommandHandled;
  action: string;
  duration?: string;
} & (
  | {
      isError: false;
    }
  | {
      isError: true;
      error: DomainError | Error;
    }
) &
  AbstractMessageMetadata<string>;

export type QueryHandledLogData = {
  type: typeof LogTypes.QueryHandled;
  action: string;
  duration?: string;
  queryData: any;
} & (
  | {
      isError: false;
    }
  | {
      isError: true;
      error: DomainError | Error;
    }
) &
  AbstractMessageMetadata<string>;

export type EventHandledLogData = {
  type: typeof LogTypes.EventHandled;
  action: string;
  duration?: string;
  handlerName: string;
} & (
  | {
      isError: false;
    }
  | {
      isError: true;
      error: DomainError | Error;
    }
) &
  AbstractMessageMetadata<string>;

export type EventPublishedLogData = {
  type: typeof LogTypes.EventPublished;
  action: string;
} & AbstractMessageMetadata<string>;
