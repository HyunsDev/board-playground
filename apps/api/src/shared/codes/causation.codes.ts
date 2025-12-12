import { deepMerge, ExtractEnumValues } from '@workspace/common';

import { CommandCodes } from './command.codes';
import { DomainEventCodes } from './domain-event.codes';
import { TriggerCodes } from './trigger.codes';

/**
 * CausationCode는 Command, Query, DomainEvent 원인(Cause)을 나타내는 코드 타입입니다.
 * Query는 일반적으로 상태 변경을 일으키지 않으므로 CausationCode에 포함되지 않습니다.
 */
export const CausationCodes = deepMerge(CommandCodes, DomainEventCodes, TriggerCodes);
export type CausationCode = ExtractEnumValues<typeof CausationCodes>;
