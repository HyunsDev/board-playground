import {
  EnsurePublic,
  AccessDeniedError,
  InvalidAccessTokenError,
  ExpiredTokenError,
  MissingTokenError,
} from '@workspace/backend-ddd';

export type GlobalDomainError = EnsurePublic<
  AccessDeniedError | InvalidAccessTokenError | ExpiredTokenError | MissingTokenError
>;
