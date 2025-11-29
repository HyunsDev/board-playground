import { EXCEPTION } from '@workspace/contract';

import { BaseException } from './base.exception';

export class ArgumentInvalidException extends BaseException {
  code: string = EXCEPTION.COMMON.ARGUMENT_INVALID.code;
  message: string = EXCEPTION.COMMON.ARGUMENT_INVALID.message;
}

export class ArgumentNotProvidedException extends BaseException {
  code: string = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED.code;
  message: string = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED.message;
}

export class ConflictException extends BaseException {
  code: string = EXCEPTION.COMMON.CONFLICT.code;
  message: string = EXCEPTION.COMMON.CONFLICT.message;
}

export class NotFoundException extends BaseException {
  code: string = EXCEPTION.COMMON.NOT_FOUND.code;
  message: string = EXCEPTION.COMMON.NOT_FOUND.message;
}

export class ForbiddenException extends BaseException {
  code: string = EXCEPTION.COMMON.FORBIDDEN.code;
  message: string = EXCEPTION.COMMON.FORBIDDEN.message;
}

export class InternalServerErrorException extends BaseException {
  code: string = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.code;
  message: string = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.message;
}
