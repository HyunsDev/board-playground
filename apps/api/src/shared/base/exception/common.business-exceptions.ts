import { EXCEPTION } from '@workspace/contract';

import { BusinessException, ExceptionBody } from './base.business-exception';

export class NotFoundException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.NOT_FOUND, details?: any) {
    super(body, details);
  }
}

export class AccessDeniedException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.ACCESS_DENIED, details?: any) {
    super(body, details);
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.UNAUTHORIZED, details?: any) {
    super(body, details);
  }
}

export class ValidationException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.VALIDATION_ERROR, details?: any) {
    super(body, details);
  }
}

export class InternalServerErrorException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR, details?: any) {
    super(body, details);
  }
}

export class ArgumentNotProvidedException extends InternalServerErrorException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED, details?: any) {
    super(body, details);
  }
}

export class BadRequestException extends BusinessException {
  constructor(body: ExceptionBody = EXCEPTION.COMMON.BAD_REQUEST, details?: any) {
    super(body, details);
  }
}
