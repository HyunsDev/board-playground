import { BaseLogData } from './base-log.types';
import { DomainLogData } from './domain-log.types';
import { HttpLogData } from './http-log.types';
import { MessageLogData } from './message-log.types';
import { SystemLogData } from './system-log.types';

export type LogData = BaseLogData | HttpLogData | MessageLogData | DomainLogData | SystemLogData;
