import {
  CommandCodeRecord,
  DomainEventCodeRecord,
  QueryCodeRecord,
} from '@/shared/types/code-record.types';

export const DevtoolsCommandCodes = {
  ForceLogin: 'devtools.command.force-login',
  ForceRegister: 'devtools.command.force-register',
  ResetDB: 'devtools.command.reset-db',
} as const satisfies CommandCodeRecord;

export const DevtoolsQueryCodes = {} as const satisfies QueryCodeRecord;

export const DevtoolsEventCodes = {} as const satisfies DomainEventCodeRecord;
