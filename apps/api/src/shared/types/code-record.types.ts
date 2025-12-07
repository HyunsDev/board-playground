import { DomainCode, DomainCodes } from '../codes/domain.codes';

export type AggregateCodeString = `${DomainCode}.${string}`;
export type AggregateCodeRecord = Record<string, AggregateCodeString>;

export type CommandCodeString = `${DomainCode}.command.${string}`;
export type CommandCodeRecord = Record<string, CommandCodeString>;

export type QueryCodeString = `${DomainCode}.query.${string}`;
export type QueryCodeRecord = Record<string, QueryCodeString>;

export type DomainEventCodeString = `${DomainCode}.event.${string}`;
export type DomainEventCodeRecord = Record<string, DomainEventCodeString>;

export type TriggerCodeString = `${typeof DomainCodes.Infra}.trigger.${string}`;
export type TriggerCodeRecord = Record<string, TriggerCodeString>;
