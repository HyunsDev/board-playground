import { DomainError, MessageMetadata } from '@/shared/base';
import { CommandCode } from '@/shared/codes/command.codes';
import { DomainEventCode } from '@/shared/codes/domain-event.codes';
import { QueryCode } from '@/shared/codes/query.codes';

export const LogTypes = {
  CommandHandled: 'CQRS_COMMAND_HANDLED',
  QueryHandled: 'CQRS_QUERY_HANDLED',
  EventHandled: 'CQRS_EVENT_HANDLED',
  EventPublished: 'CQRS_EVENT_PUBLISHED',
};
export type LogType = (typeof LogTypes)[keyof typeof LogTypes];

export type CommandHandledLogData = {
  type: typeof LogTypes.CommandHandled;
  action: CommandCode;
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
  MessageMetadata;

export type QueryHandledLogData = {
  type: typeof LogTypes.QueryHandled;
  action: QueryCode;
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
  MessageMetadata;

export type EventHandledLogData = {
  type: typeof LogTypes.EventHandled;
  action: DomainEventCode;
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
  MessageMetadata;

export type EventPublishedLogData = {
  type: typeof LogTypes.EventPublished;
  action: DomainEventCode;
} & MessageMetadata;
