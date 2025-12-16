import { DomainCode } from '@workspace/domain';

import { LogTypeEnum } from '../log.enums';
import { SystemLogAction, SystemLogData } from '../types/system-log.types';

export const systemLog = (
  domain: DomainCode,
  action: SystemLogAction,
  {
    msg,
    data,
    error,
  }: {
    msg?: string;
    data: Record<string, unknown>;
    error: Error | unknown;
  },
): SystemLogData => {
  return {
    type: LogTypeEnum['System'],
    domain,
    action,
    msg: msg || action,
    data,
    error,
  };
};
