import {
  CommandCodeRecord,
  DomainEventCodeRecord,
  QueryCodeRecord,
} from '@/shared/types/code-record.types';

export const AuthQueryCodes = {
  CheckUsernameAvailable: 'auth.query.check-username-available',
} as const satisfies QueryCodeRecord;

export const AuthCommandCodes = {
  Login: 'auth.command.login',
  Register: 'auth.command.register',
  RefreshToken: 'auth.command.refresh-token',
  Logout: 'auth.command.logout',
} as const satisfies CommandCodeRecord;

export const AuthEventCodes = {} as const satisfies DomainEventCodeRecord;
