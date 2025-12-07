import { DomainCodeKey } from './domain.codes';
import { DomainEventCodeRecord } from '../types/code-record.types';
import { DistributiveValueOf } from '../types/distributive-value-of.type';

import { AuthEventCodes } from '@/domains/auth/auth.contracts';
import { SessionEventCodes } from '@/domains/session/session.constants';
import { UserEventCodes } from '@/domains/user/user.constant';
import { DevtoolsEventCodes } from '@/infra/devtools/devtools.contracts';

export const DomainEventCodes = {
  Infra: {},
  Auth: AuthEventCodes,
  User: UserEventCodes,
  Session: SessionEventCodes,
  Devtools: DevtoolsEventCodes,
} as const satisfies Record<DomainCodeKey, DomainEventCodeRecord>;

export type DomainEventCode = DistributiveValueOf<typeof DomainEventCodes>;
