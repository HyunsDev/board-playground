export interface ApiError<T = any> {
  status: number;
  code: string;
  message: string;
  details?: T;
}
