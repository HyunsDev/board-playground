import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RequestValidationError } from '@ts-rest/nest';
import { Response } from 'express';

import { apiErr } from '@workspace/backend-ddd';
import { ValidationDetails } from '@workspace/common';
import { ApiErrors } from '@workspace/contract';

@Catch(RequestValidationError)
export class RequestValidationFilter implements ExceptionFilter<RequestValidationError> {
  catch(exception: RequestValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const details: ValidationDetails = {
      body: exception.body?.issues || null,
      query: exception.query?.issues || null,
      pathParams: exception.pathParams?.issues || null,
      headers: exception.headers?.issues || null,
    };

    const res = apiErr(ApiErrors.Common.ValidationError, details);
    void response.status(res.status).json(res.body);
  }
}
