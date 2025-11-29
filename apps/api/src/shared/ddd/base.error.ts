export interface DomainErrorProps<T = unknown> {
  message: string;
  code: string;
  details?: T;
}

export class DomainError<T = unknown> {
  public readonly message: string;
  public readonly code: string;
  public readonly details?: T;

  constructor(public readonly props: DomainErrorProps<T>) {
    this.message = props.message;
    this.code = props.code;
    this.details = props.details;
  }
}
