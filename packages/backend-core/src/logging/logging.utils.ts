import { DomainError } from '@workspace/backend-ddd';

import {
  CommandHandledLogData,
  EventHandledLogData,
  EventPublishedLogData,
  LogTypes,
  QueryHandledLogData,
} from './log.types';

export const isCommandHandlerLogData = (a: Record<string, any>): a is CommandHandledLogData => {
  return a.type === LogTypes.CommandHandled;
};
export const isQueryHandlerLogData = (a: Record<string, any>): a is QueryHandledLogData => {
  return a.type === LogTypes.QueryHandled;
};
export const isEventHandlerLogData = (a: Record<string, any>): a is EventHandledLogData => {
  return a.type === LogTypes.EventHandled;
};
export const isEventPublishedLogData = (a: Record<string, any>): a is EventPublishedLogData => {
  return a.type === LogTypes.EventPublished;
};
export const isDomainError = (err: DomainError | Error): err is DomainError =>
  err && typeof err === 'object' && 'code' in err;
