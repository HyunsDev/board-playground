import { DomainCodeKey } from './domain.codes';
import { CommandCodeRecord } from '../types/code-record.types';
import { DistributiveValueOf } from '../types/distributive-value-of.type';

import { AuthCommandCodes } from '@/domains/auth/auth.contracts';
import { SessionCommandCodes } from '@/domains/session/session.constants';
import { UserCommandCodes } from '@/domains/user/user.constant';
import { DevtoolsCommandCodes } from '@/infra/devtools/devtools.contracts';

export const CommandCodes = {
  Infra: {},
  Auth: AuthCommandCodes,
  User: UserCommandCodes,
  Session: SessionCommandCodes,
  Devtools: DevtoolsCommandCodes,
} as const satisfies Record<DomainCodeKey, CommandCodeRecord>;

export type CommandCode = DistributiveValueOf<typeof CommandCodes>;
