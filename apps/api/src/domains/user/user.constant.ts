import {
  CommandCodeRecord,
  DomainEventCodeRecord,
  QueryCodeRecord,
} from '@/shared/types/code-record.types';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export const UserCommandCodes = {
  DeleteMe: `user.command.delete-me`,
  UpdateMeProfile: `user.command.update-me-profile`,
  UpdateMeUsername: `user.command.update-me-username`,
} as const satisfies CommandCodeRecord;

export const UserQueryCodes = {
  GetForAdmin: `user.query.get-for-admin`,
  GetMe: `user.query.get-me`,
  Get: `user.query.get`,
  Search: `user.query.search`,
} as const satisfies QueryCodeRecord;

export const UserEventCodes = {
  Created: `user.event.created`,
} as const satisfies DomainEventCodeRecord;
