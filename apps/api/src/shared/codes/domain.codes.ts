export const DomainCodes = {
  Infra: 'infra',
  Auth: 'auth',
  User: 'user',
  Session: 'session',
  Devtools: 'devtools',
} as const;

export type DomainCodeKey = keyof typeof DomainCodes;
export type DomainCode = (typeof DomainCodes)[DomainCodeKey];
