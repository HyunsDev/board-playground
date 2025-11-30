import {
  AccessDeniedError,
  ConflictError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../ddd';

export function mapDomainErrorToResponse(error: DomainError) {
  if (error instanceof NotFoundError) {
    return {
      status: 404,
      body: {
        code: error.code,
        status: 404,
        message: error.message,
        details: error.details,
      },
    } as const;
  }

  if (error instanceof ConflictError) {
    return {
      status: 409,
      body: {
        code: error.code,
        status: 409,
        message: error.message,
        details: error.details,
      },
    } as const;
  }

  if (error instanceof UnauthorizedError) {
    return {
      status: 401,
      body: {
        code: error.code,
        status: 401,
        message: error.message,
        details: error.details,
      },
    } as const;
  }

  if (error instanceof AccessDeniedError) {
    return {
      status: 403,
      body: {
        code: error.code,
        status: 403,
        message: error.message,
        details: error.details,
      },
    } as const;
  }

  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        code: error.code,
        status: 400,
        message: error.message,
        details: error.details,
      },
    } as const;
  }

  throw error;
}
