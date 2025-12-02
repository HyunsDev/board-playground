import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { err } from 'neverthrow';
import { catchError, Observable, of, tap } from 'rxjs';

import { DomainEventDispatcher } from '../domain-event.dispatcher';

class TransactionRollbackError<E> extends Error {
  constructor(public readonly originalError: E) {
    super('ROLLBACK');
  }
}

@Injectable()
export class TransactionResultInterceptor implements NestInterceptor {
  constructor(private readonly eventDispatcher: DomainEventDispatcher) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log('TransactionResultInterceptor intercepting...');
    return next.handle().pipe(
      tap(async (result) => {
        console.log('TransactionResultInterceptor received result:', result);

        // 1. Result 패턴인지 확인
        if (result && typeof result.isErr === 'function') {
          if (result.isErr()) {
            console.log('TransactionResultInterceptor detected error result:', result.error);
            // Err라면 강제로 예외를 던져서 트랜잭션 롤백 유도
            throw new TransactionRollbackError(result.error);
          }
        }
        // 2. 성공(Ok)이라면 이벤트 발행
        await this.eventDispatcher.dispatchAll();
      }),
      catchError((error) => {
        console.log('TransactionResultInterceptor caught error:', error);
        // 3. 롤백 유도용 예외였다면, 다시 정상적인 Err 객체로 변환하여 리턴
        if (error instanceof TransactionRollbackError) {
          return of(err(error.originalError)); // RxJS of 사용
        }
        // 진짜 에러라면 이벤트 클리어
        this.eventDispatcher.clear();
        throw error;
      }),
    );
  }
}
