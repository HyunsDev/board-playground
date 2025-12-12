import {
  CommandCodeRecord,
  DomainEventCodeRecord,
  QueryCodeRecord,
} from '@/shared/types/code-record.types';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
export const SessionEventCodes = {
  Created: `session.event.created`,
  Deleted: `session.event.deleted`,
  Refreshed: `session.event.refreshed`,
  RefreshTokenReuseDetected: `session.event.refresh-token-reuse-detected`,
} as const satisfies DomainEventCodeRecord;
export const SessionCommandCodes = {
  Delete: `session.command.delete`,
} as const satisfies CommandCodeRecord;
export const SessionQueryCodes = {
  Get: `session.query.get`,
  List: `session.query.list`,
} as const satisfies QueryCodeRecord;
