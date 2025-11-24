export interface BaseException {
  code: string;
  status: number;
  message: string;
  correlationId?: string;
  details?: any;
}

export type ExceptionRecord = Record<string, BaseException>;
