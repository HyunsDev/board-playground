export interface BaseException {
  code: string;
  status: number;
  message: string;
  details?: any;
}

export type ExceptionRecord = Record<string, BaseException>;
