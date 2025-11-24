import { v7 as uuidv7 } from 'uuid';

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

export class Command {
  readonly id: string;
  readonly metadata: CommandMetadata;

  constructor(props: Partial<CommandMetadata> & { id?: string } = {}) {
    this.id = props.id || uuidv7();

    // 메타데이터 설정
    this.metadata = {
      correlationId: props.correlationId || uuidv7(), // 없으면 새로 생성 (Fallback)
      causationId: props.causationId,
      userId: props.userId,
      timestamp: props.timestamp || Date.now(),
    };
  }
}
