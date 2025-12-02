import { Injectable } from '@nestjs/common';
import { err, Result } from 'neverthrow';

import { DatabaseService } from './database.service'; // CLS가 적용된 Prisma Client
import { DomainEventDispatcher } from './domain-event.dispatcher';

@Injectable()
export class TransactionManager {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly eventDispatcher: DomainEventDispatcher,
    // private readonly context: ContextService, // [삭제 1] 더 이상 필요 없음
  ) {}

  async run<T, E>(operation: () => Promise<Result<T, E>>): Promise<Result<T, E>> {
    try {
      // 1. Prisma Transaction 시작
      // nestjs-cls 어댑터가 적용된 prisma.$transaction을 호출하면,
      // 콜백 내부에서 실행되는 모든 쿼리는 자동으로 해당 트랜잭션을 탄다.
      const result = await this.prisma.$transaction(async () => {
        // [삭제 2] this.context.setTx(tx); // CLS가 알아서 함

        try {
          const res = await operation();

          // 2. Result 패턴의 Err가 나오면 강제로 예외를 던져서 롤백 유도
          if (res.isErr()) {
            // 여기서 던진 에러는 catch 블록으로 감
            // 팁: 일반 Error로 감싸서 던져야 catch에서 구분이 쉬움 (선택사항)
            throw new TransactionRollbackError(res.error);
          }

          return res;
        } catch (error) {
          // 내가 의도적으로 던진 롤백용 에러인지 확인
          if (error instanceof TransactionRollbackError) {
            // Prisma 트랜잭션은 예외를 던져야 롤백됨.
            // 하지만 우리는 상위 레이어(Controller)에는 다시 Result(Err)를 리턴하고 싶음.
            // 여기서 throw를 하면 트랜잭션은 롤백되지만, 함수 전체가 throw를 하게 됨.

            // *중요*: Prisma $transaction 안에서 return 값을 내보내려면
            // 예외를 던져서 롤백시키는 방법 밖에 없음.
            // 따라서 여기서 throw 하고, 바깥에서 잡아서 다시 Err로 변환하거나,
            // 혹은 아예 상위 구조를 바꿔야 함.

            throw error;
          }

          // 예측하지 못한 기술적 에러
          this.eventDispatcher.clear();
          throw error;
        }
        // [삭제 3] finally { this.context.clearTx(); } // CLS가 알아서 함
      });

      // 3. 커밋 성공 후에만 이벤트 발행
      await this.eventDispatcher.dispatchAll();

      return result;
    } catch (error) {
      // 트랜잭션 내부에서 던져진 롤백용 에러인지 확인
      if (error instanceof TransactionRollbackError) {
        return err(error.originalError);
      }

      // 예측하지 못한 기술적 에러
      throw error;
    }
  }
}

// 롤백을 위해 임시로 던지는 에러 클래스
class TransactionRollbackError<E> extends Error {
  constructor(public readonly originalError: E) {
    super('ROLLBACK');
  }
}
