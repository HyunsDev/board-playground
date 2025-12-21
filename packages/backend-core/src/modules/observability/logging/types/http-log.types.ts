import { BaseLogData } from './base-log.types';

export interface HttpLogData extends BaseLogData {
  httpMethod: string;
  reqUrl: string;
  resStatus: number;
  responseTime: string;
  userId?: string;
  errorCode?: string;
}
