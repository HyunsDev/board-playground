export const AggregateCodes = {
  User: 'user',
  Session: 'session',
} as const;

export type AggregateCodeKey = keyof typeof AggregateCodes;
export type AggregateCode = (typeof AggregateCodes)[AggregateCodeKey];
