import { SendMailOptions } from 'nodemailer';

import { BaseInternalServerError, DomainErrorScope } from '@workspace/backend-ddd';

export class FailedToSendMailError extends BaseInternalServerError<
  'FailedToSendMailError',
  {
    options: SendMailOptions;
    originalError?: unknown;
  }
> {
  readonly code = 'FailedToSendMailError';
  readonly scope: DomainErrorScope = 'private';

  constructor(options: SendMailOptions, originalError?: unknown) {
    super(`Failed to send mail`, {
      options,
      originalError,
    });
  }
}
