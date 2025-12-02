import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RequestValidationError } from '@ts-rest/nest';
import { Response } from 'express';

import { ApiErrorResponse, EXCEPTION, ValidationDetails } from '@workspace/contract';

@Catch(RequestValidationError)
export class RequestValidationFilter implements ExceptionFilter<RequestValidationError> {
  catch(exception: RequestValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    const details: ValidationDetails = {
      body: exception.body?.issues || null,
      query: exception.query?.issues || null,
      pathParams: exception.pathParams?.issues || null,
      headers: exception.headers?.issues || null,
    };

    const errorResponse: ApiErrorResponse = {
      ...EXCEPTION.COMMON.VALIDATION_ERROR,
      details,
    };

    response.status(status).json(errorResponse);
  }
}
