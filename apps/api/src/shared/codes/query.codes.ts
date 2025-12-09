import { DomainCodeKey } from './domain.codes';
import { QueryCodeRecord } from '../types/code-record.types';
import { DistributiveValueOf } from '../types/distributive-value-of.type';

import { AuthQueryCodes } from '@/domains/auth/auth.contracts';
import { SessionQueryCodes } from '@/domains/session/session.constants';
import { UserQueryCodes } from '@/domains/user/user.constants';
import { DevtoolsQueryCodes } from '@/infra/devtools/devtools.contracts';

export const QueryCodes = {
  Infra: {},
  Auth: AuthQueryCodes,
  User: UserQueryCodes,
  Session: SessionQueryCodes,
  Devtools: DevtoolsQueryCodes,
} as const satisfies Record<DomainCodeKey, QueryCodeRecord>;

export type QueryCode = DistributiveValueOf<typeof QueryCodes>;
