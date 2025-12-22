import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { err, ok } from 'neverthrow';

import { DomainResult, InternalServerErrorException } from '@workspace/backend-ddd';

import {
  BaseHttpRequest,
  BaseHttpRequestData,
  BaseHttpRequestProps,
  HttpRequestError,
  HttpRequestResponseData,
} from '@/base';
import { MessageContext } from '@/modules/foundation';
import { LogTypeEnum, measureAndLog } from '@/modules/observability';
import { toHttpRequestLogData } from '@/modules/observability/logging/mappers/toHttpRequestLogData';

@Injectable()
export class HttpClient {
  private logger = new Logger(HttpClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly messageContext: MessageContext,
  ) {}

  async request<
    TOk extends HttpRequestResponseData,
    TResult extends DomainResult<TOk, HttpRequestError>,
    TReq extends BaseHttpRequest<BaseHttpRequestProps<BaseHttpRequestData>, TOk>,
  >(httpRequest: TReq): Promise<TResult> {
    const metadata = this.messageContext.getOrThrowDrivenMetadata();
    httpRequest.updateMetadata(metadata);

    const axiosRequest = async () => {
      try {
        const res = await this.httpService.axiosRef.request({
          url: httpRequest.data.url,
          method: httpRequest.data.method,
          headers: httpRequest.data.headers,
          params: httpRequest.data.params,
          data: httpRequest.data.data,
          timeout: httpRequest.data.timeoutMs,
        });

        const responseData: HttpRequestResponseData = {
          status: res.status,
          data: res.data,
          headers: res.headers,
        };

        return ok(responseData) as TResult;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          return err(
            new HttpRequestError('HTTP Request Error', {
              isRequestError: !!error.request,
              originalError: error,
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers,
            }),
          ) as TResult;
        }

        throw new InternalServerErrorException(
          'Unexpected error occurred during HTTP request',
          {},
          error,
        );
      }
    };

    const retryCount = httpRequest.options?.retryCount ?? 0;
    const delayMs = httpRequest.options?.retryDelayMs ?? 1000;
    const executor = async () => {
      for (let attempt = 0; attempt <= retryCount; attempt++) {
        const result = await axiosRequest();
        if (result.isOk() || attempt === retryCount) {
          return result;
        }
        if (!this.shouldRetry(result.error)) {
          return result;
        }

        if (result.isErr() && result.error.details?.status)
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
      }
      return axiosRequest();
    };

    return await measureAndLog({
      logType: LogTypeEnum.HttpRequest,
      message: httpRequest,
      executor: executor,
      toLogData: toHttpRequestLogData,
      logger: this.logger,
      handlerName: `${httpRequest.constructor.name}Handler`,
    });
  }

  private shouldRetry(error?: HttpRequestError): boolean {
    if (error?.details?.status) {
      const { status } = error.details;
      if (status >= 500 && status < 600) return true;
      if (status === 429) return true;
      return false;
    }
    return true;
  }
}
