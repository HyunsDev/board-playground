import { HttpException } from '@nestjs/common';

export type ExceptionBody = {
  status: number;
  code: string;
  message: string;
};

export class BusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: any;

  constructor(body: ExceptionBody, details?: any) {
    super(body.message, body.status);
    this.code = body.code;
    this.details = details;
  }
}
