import { HttpException } from '@nestjs/common';

export class BusinessException extends HttpException {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message, status);
    this.code = code;
    this.details = details;
  }
}
