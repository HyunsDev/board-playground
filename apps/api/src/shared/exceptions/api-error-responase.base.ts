export class ApiErrorResponse {
  readonly code: string;
  readonly status: number;
  readonly message: string;
  readonly correlationId?: string;
  readonly details?: any;

  constructor(body: ApiErrorResponse) {
    this.code = body.code;
    this.status = body.status;
    this.message = body.message;
    this.correlationId = body.correlationId;
    this.details = body.details;
  }
}
