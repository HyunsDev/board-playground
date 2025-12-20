import { InternalServerErrorException } from '@workspace/backend-ddd';

export class JobCodeMismatchException extends InternalServerErrorException {
  constructor(expected: string, actual: string) {
    super(`Job code mismatch: expected ${expected}, but got ${actual}`);
    this.name = 'JobCodeMismatchException';
  }
}
