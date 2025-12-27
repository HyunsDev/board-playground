import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { ResultAsync } from 'neverthrow';

import {
  DomainResult,
  DomainResultAsync,
  InternalServerErrorException,
} from '@workspace/backend-ddd';
import { TriggerCodeEnum } from '@workspace/domain';

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

  request<
    TOk extends HttpRequestResponseData,
    TResult extends DomainResultAsync<TOk, HttpRequestError>,
    TReq extends BaseHttpRequest<BaseHttpRequestProps<BaseHttpRequestData>, TOk>,
  >(httpRequest: TReq): TResult {
    const metadata = this.messageContext.getOrCreateDrivenMetadata(TriggerCodeEnum.SystemBoot);
    httpRequest.updateMetadata(metadata);

    const axiosRequest = () =>
      ResultAsync.fromPromise(
        this.httpService.axiosRef.request({
          url: httpRequest.data.url,
          method: httpRequest.data.method,
          headers: httpRequest.data.headers,
          params: httpRequest.data.params,
          data: httpRequest.data.data,
          timeout: httpRequest.data.timeoutMs,
        }),
        (error) => {
          if (error instanceof AxiosError) {
            return new HttpRequestError('HTTP Request Error', {
              isRequestError: !!error.request,
              originalError: error,
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers,
            });
          }
          throw new InternalServerErrorException(
            'Unexpected error occurred during HTTP request',
            {},
            error,
          );
        },
      ).map(
        (res) =>
          ({
            status: res.status,
            data: res.data,
            headers: res.headers,
          }) as TOk,
      );

    const retryCount = httpRequest.options?.retryCount ?? 0;
    const delayMs = httpRequest.options?.retryDelayMs ?? 1000;

    const executor = (): DomainResultAsync<TOk, HttpRequestError> => {
      return new ResultAsync(
        (async (): Promise<DomainResult<TOk, HttpRequestError>> => {
          let lastResult: DomainResult<TOk, HttpRequestError>;

          for (let attempt = 0; attempt <= retryCount; attempt++) {
            // 1. 요청 실행 (ResultAsync를 await하여 Result<T, E>로 받음)
            lastResult = await axiosRequest();

            // 2. 성공했으면 즉시 반환
            if (lastResult.isOk()) {
              return lastResult;
            }

            // 3. 재시도 불가능한 상황인지 체크
            // (마지막 시도이거나, 재시도 대상 에러가 아닌 경우)
            const isLastAttempt = attempt === retryCount;
            const isNotRetryable = !this.shouldRetry(lastResult.error);

            if (isLastAttempt || isNotRetryable) {
              return lastResult;
            }

            // 4. 대기 (재시도 전 딜레이)
            if (delayMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          // 루프 로직상 도달할 수 없지만 TS 타입 추론을 위해 추가
          // (위의 if 문들에서 반드시 리턴됨)
          return lastResult!;
        })(),
      );
    };

    return new ResultAsync(
      measureAndLog({
        logType: LogTypeEnum.HttpRequest,
        message: httpRequest,
        executor: executor,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
        toLogData: (result, message) => toHttpRequestLogData(result as any, message),
        logger: this.logger,
        handlerName: `${httpRequest.constructor.name}Handler`,
      }).then((measured) => {
        return measured.value;
      }),
    ) as TResult;
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
