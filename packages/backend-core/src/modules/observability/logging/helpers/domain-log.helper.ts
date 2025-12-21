import { DomainCode } from '@workspace/domain';

import { LogTypeEnum } from '../log.enums';
import { DomainLogData } from '../types/domain-log.types';

export const domainLog = (
  domain: DomainCode,
  code: string,
  {
    msg,
    data,
  }: {
    msg?: string;
    data: Record<string, unknown>;
  },
): DomainLogData => {
  return {
    type: LogTypeEnum['Domain'],
    domain,
    code,
    msg: msg || code,
    data,
  };
};
