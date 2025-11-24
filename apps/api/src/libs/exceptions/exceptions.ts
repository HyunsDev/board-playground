import { EXCEPTION } from '@workspace/contract';

import { ExceptionBase } from './base.exception';

export class ArgumentInvalidException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.ARGUMENT_INVALID.code;
  readonly message = EXCEPTION.COMMON.ARGUMENT_INVALID.message;
}

export class ArgumentNotProvidedException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED.code;
  readonly message = EXCEPTION.COMMON.ARGUMENT_NOT_PROVIDED.message;
}

export class ConflictException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.CONFLICT.code;
  readonly message = EXCEPTION.COMMON.CONFLICT.message;
}

export class NotFoundException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.NOT_FOUND.code;
  readonly message = EXCEPTION.COMMON.NOT_FOUND.message;
}

export class ForbiddenException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.FORBIDDEN.code;
  readonly message = EXCEPTION.COMMON.FORBIDDEN.message;
}

export class InternalServerErrorException extends ExceptionBase {
  readonly code = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.code;
  readonly message = EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.message;
}
