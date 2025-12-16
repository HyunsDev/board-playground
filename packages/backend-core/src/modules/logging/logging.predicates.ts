import { LogTypeEnum } from './log.enums';
import {
  CommandLogData,
  EventLogData,
  EventPublishedLogData,
  HttpLogData,
  JobLogData,
  QueryLogData,
} from './types';
import { DomainLogData } from './types/domain-log.types';

export const isHttpLog = (log: {
  httpMethod?: string;
  responseTime?: string;
}): log is HttpLogData => {
  return !!(log.httpMethod && log.responseTime);
};

export const isDomainLog = (log: { type?: string }): log is DomainLogData => {
  return log?.type === LogTypeEnum.Domain;
};

export const isCommandLog = (log: { type?: string }): log is CommandLogData => {
  return log?.type === LogTypeEnum.Command;
};

export const isQueryLog = (log: { type?: string }): log is QueryLogData => {
  return log?.type === LogTypeEnum.Query;
};

export const isEventLog = (log: { type?: string }): log is EventLogData => {
  return log?.type === LogTypeEnum.Event;
};

export const isEventPublishedLog = (log: { type?: string }): log is EventPublishedLogData => {
  return log?.type === LogTypeEnum.EventPublished;
};

export const isJobLog = (log: { type?: string }): log is JobLogData => {
  return log?.type === LogTypeEnum.Job;
};
