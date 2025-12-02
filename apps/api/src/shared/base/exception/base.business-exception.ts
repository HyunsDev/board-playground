import { HttpException } from '@nestjs/common';

import { ApiErrorResponse } from '@workspace/contract';

export class BusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: any;

  constructor(error: ApiErrorResponse, details?: any) {
    super(error.message, error.status);
    this.code = error.code;
    this.details = details;
  }
}
