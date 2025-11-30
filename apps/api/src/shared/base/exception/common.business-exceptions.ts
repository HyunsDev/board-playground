import { BusinessException } from './base.business-exception';

export class NotFoundException extends BusinessException {
  constructor(message: string = 'Not Found', code: string = 'NOT_FOUND', details?: any) {
    super(message, code, 404, details);
  }
}

export class AccessDeniedException extends BusinessException {
  constructor(message: string = 'Access Denied', code: string = 'ACCESS_DENIED', details?: any) {
    super(message, code, 403, details);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED', details?: any) {
    super(message, code, 401, details);
  }
}

export class ValidationException extends BusinessException {
  constructor(
    message: string = 'Validation Error',
    code: string = 'VALIDATION_ERROR',
    details?: any,
  ) {
    super(message, code, 422, details);
  }
}

export class InternalServerErrorException extends BusinessException {
  constructor(
    message: string = 'Internal Server Error',
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: any,
  ) {
    super(message, code, 500, details);
  }
}

export class ArgumentNotProvidedException extends InternalServerErrorException {
  constructor(
    message: string = 'Argument Not Provided',
    code: string = 'ARGUMENT_NOT_PROVIDED',
    details?: any,
  ) {
    super(message, code, details);
  }
}
