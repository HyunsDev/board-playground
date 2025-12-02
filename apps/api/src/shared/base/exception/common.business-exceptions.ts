import { ApiErrorResponse, EXCEPTION } from '@workspace/contract';

import { BusinessException } from './base.business-exception';

export class NotFoundException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.NOT_FOUND, details?: any) {
    super(error, details);
  }
}

export class AccessDeniedException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.ACCESS_DENIED, details?: any) {
    super(error, details);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.UNAUTHORIZED, details?: any) {
    super(error, details);
  }
}

export class ValidationException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.VALIDATION_ERROR, details?: any) {
    super(error, details);
  }
}

export class InternalServerErrorException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR, details?: any) {
    super(error, details);
  }
}

export class ArgumentNotProvidedException extends InternalServerErrorException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED, details?: any) {
    super(error, details);
  }
}

export class BadRequestException extends BusinessException {
  constructor(error: ApiErrorResponse = EXCEPTION.COMMON.BAD_REQUEST, details?: any) {
    super(error, details);
  }
}
