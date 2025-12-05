import { Command } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { DomainError } from '../error';

import { DomainResult } from '@/shared/types/result.type';

export type CommandMetadata = {
  readonly commandId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: number;
};

export type CommandProps<T> = {
  readonly data: T;
  readonly metadata?: Partial<CommandMetadata>;
};

/**
 * BaseCommand는 모든 커맨드의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 커맨드는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template P - 커맨드의 데이터와 메타데이터를 포함하는 타입
 * @template Res - 커맨드 핸들러의 반환 타입
 * @template O - 커맨드 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseCommand<
  P extends CommandProps<unknown>,
  Res extends DomainResult<O, DomainError>,
  O,
> extends Command<Res> {
  readonly data: P['data'];
  readonly metadata: CommandMetadata;

  constructor(data: P['data'], metadata?: Partial<CommandMetadata>) {
    super();
    const commandId = metadata?.commandId || uuidv7();
    this.metadata = {
      commandId,
      // correlationId가 없으면 현재 커맨드의 ID를 사용 (Trace 시작점)
      correlationId: metadata?.correlationId || commandId,
      causationId: metadata?.causationId,
      userId: metadata?.userId,
      timestamp: metadata?.timestamp || Date.now(),
    };
    this.data = data;
  }
}
