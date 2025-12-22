import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  AbstractHttpRequestProps,
  AbstractHttpRequest,
  DomainError,
  DomainResult,
  RESULT_TYPE_SYMBOL,
} from '@workspace/backend-ddd';
import { CausationCode, DomainCode, HttpRequestCode } from '@workspace/domain';

import { DrivenMessageMetadata } from '../message-metadata';

export type HttpRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export type HttpRequestOptions = {
  retryCount?: number;
  retryDelayMs?: number;
};

export type BaseHttpRequestData = {
  url: string;
  method: HttpRequestMethod;
  headers?: AxiosRequestConfig['headers'];
  params?: AxiosRequestConfig['params'];
  data?: AxiosRequestConfig['data'];
  timeoutMs?: number;
};

export type HttpRequestResponseData = {
  status: number;
  data: AxiosResponse['data'];
  headers?: AxiosResponse['headers'];
};

export type HttpRequestErrorData = {
  // 요청 자체의 실패 여부
  isRequestError: boolean;
  originalError: AxiosError;

  status?: number;
  data?: AxiosResponse['data'];
  headers?: AxiosResponse['headers'];
};

export class HttpRequestError extends DomainError<'HttpRequestError', HttpRequestErrorData> {
  readonly code = 'HttpRequestError';
  readonly scope = 'private';

  constructor(message: string, details: HttpRequestErrorData) {
    super(message, details);
  }
}

export type BaseHttpRequestProps<T extends BaseHttpRequestData> = AbstractHttpRequestProps<T>;

export abstract class BaseHttpRequest<
  const TProps extends BaseHttpRequestProps<BaseHttpRequestData>,
  const TOk extends HttpRequestResponseData,
  const TRes extends DomainResult<TOk, HttpRequestError>,
> extends AbstractHttpRequest<
  CausationCode,
  DomainCode,
  HttpRequestCode,
  TProps,
  TOk,
  TRes,
  HttpRequestOptions
> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
  static readonly code: HttpRequestCode;

  constructor(
    data: TProps['data'],
    metadata?: DrivenMessageMetadata,
    options?: HttpRequestOptions,
  ) {
    super(null, data, metadata, options);
  }

  get options(): HttpRequestOptions {
    return {
      retryCount: this._options?.retryCount ?? 0,
      retryDelayMs: this._options?.retryDelayMs ?? 1000,
      ...this._options,
    };
  }
}
