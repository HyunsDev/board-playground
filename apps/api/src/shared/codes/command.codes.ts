import { ExtractEnumValues } from '@workspace/common';

import { DomainCodeKey } from './domain.codes';
import { CommandCodeRecord } from '../types/code-record.types';

import { AuthCommandCodes } from '@/domains/auth/auth.contracts';
import { SessionCommandCodes } from '@/domains/session/session.constants';
import { UserCommandCodes } from '@/domains/user/user.constants';
import { DevtoolsCommandCodes } from '@/infra/devtools/devtools.contracts';

export const CommandCodes = {
  Infra: {},
  Auth: AuthCommandCodes,
  User: UserCommandCodes,
  Session: SessionCommandCodes,
  Devtools: DevtoolsCommandCodes,
} as const satisfies Record<DomainCodeKey, CommandCodeRecord>;

export type CommandCode = ExtractEnumValues<typeof CommandCodes>;
