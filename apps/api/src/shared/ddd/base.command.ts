import { Command } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

export type CommandProps<T, TRes> = Omit<T, keyof CommandBase<TRes>> & Partial<CommandBase<TRes>>;

export type CommandMetadata = {
  /**
   * 요청 추적 ID (로그, MSA 간 추적용)
   * Controller에서 ClsAccessor.getRequestId() 값을 주입해주는 것이 정석입니다.
   */
  readonly correlationId: string;

  /**
   * 인과 관계 ID (어떤 커맨드/이벤트에 의해 촉발되었는지)
   */
  readonly causationId?: string;

  /**
   * 명령을 호출한 사용자 ID
   */
  readonly userId?: string;

  /**
   * 명령 발생 시간
   */
  readonly timestamp: number;
};

export abstract class CommandBase<TRes> extends Command<TRes> {
  readonly id: string;
  readonly metadata: CommandMetadata;

  constructor(props: CommandProps<CommandBase<TRes>, TRes>) {
    super();
    this.id = props.id || uuidv7();

    // 메타데이터 설정
    this.metadata = {
      correlationId: props?.metadata?.correlationId,
      causationId: props?.metadata?.causationId,
      userId: props?.metadata?.userId,
      timestamp: props?.metadata?.timestamp || Date.now(),
    };
  }
}
