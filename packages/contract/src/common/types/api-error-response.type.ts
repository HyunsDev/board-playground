export interface ApiErrorResponse<T = any> {
  status: number;
  code: string;
  message: string;
  details?: T;
}
