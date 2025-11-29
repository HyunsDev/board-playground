import {
  ArgumentInvalidException,
  ConflictException,
  NotFoundException,
} from '@/shared/exceptions';

export function mapDomainErrorToResponse(error: Error) {
  if (error instanceof NotFoundException) {
    return {
      status: 404,
      body: {
        code: error.code,
        status: 404,
        message: error.message,
      },
    } as const;
  } else if (error instanceof ConflictException) {
    return {
      status: 409,
      body: {
        code: error.code,
        status: 409,
        message: error.message,
      },
    } as const;
  } else if (error instanceof ArgumentInvalidException) {
    return {
      status: 400,
      body: {
        code: error.code,
        status: 400,
        message: error.message,
      },
    } as const;
  }

  throw error;
}
