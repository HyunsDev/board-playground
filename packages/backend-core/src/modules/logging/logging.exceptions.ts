import { BaseInternalServerException } from '@workspace/backend-ddd';

export class InvalidHandlerException extends BaseInternalServerException<'InvalidHandlerException'> {
  readonly code = 'InvalidHandlerException' as const;
  constructor(message: string = 'InvalidHandlerException') {
    super(message);
  }
}
