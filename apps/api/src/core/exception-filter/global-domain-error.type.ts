import {
  EnsurePublic,
  AccessDeniedError,
  InvalidAccessTokenError,
  ExpiredTokenError,
  MissingTokenError,
} from '@workspace/backend-ddd';

/**
 * DomainException 으로 던질 수 있는 도메인 에러 목록입니다. 이를 제외한 도메인 에러는 던져서는 안되며 Err 로 return 해야 합니다.
 */
export type GlobalDomainError = EnsurePublic<
  AccessDeniedError | InvalidAccessTokenError | ExpiredTokenError | MissingTokenError
>;
