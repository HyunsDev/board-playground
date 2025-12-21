import { DomainCode } from '@workspace/domain';

import { BaseLogData } from './base-log.types';
import { LogTypeEnum } from '../log.enums';

export interface DomainLogData extends BaseLogData {
  type: LogTypeEnum['Domain'];
  domain: DomainCode;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}
