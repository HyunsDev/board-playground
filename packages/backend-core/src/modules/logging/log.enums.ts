import { uniqueDeepMerge } from '@workspace/common';

export const GeneralLogTypeEnum = {
  Http: 'HTTP',
  Domain: 'DOMAIN',
  General: 'GENERAL',
} as const;
export type GeneralLogTypeEnum = typeof GeneralLogTypeEnum;
export type GeneralLogType = (typeof GeneralLogTypeEnum)[keyof typeof GeneralLogTypeEnum];

export const MessageLogTypeEnum = {
  Command: 'COMMAND',
  Query: 'QUERY',
  Event: 'EVENT',
  Job: 'JOB',
  EventPublished: 'EVENT_PUBLISHED',
} as const;
export type MessageLogTypeEnum = typeof MessageLogTypeEnum;
export type MessageLogType = (typeof MessageLogTypeEnum)[keyof typeof MessageLogTypeEnum];
export const MessageLogTypes = Object.values(MessageLogTypeEnum);

export const LogTypeEnum = uniqueDeepMerge(GeneralLogTypeEnum, MessageLogTypeEnum);
export type LogTypeEnum = typeof LogTypeEnum;
export type LogType = (typeof LogTypeEnum)[keyof typeof LogTypeEnum];
