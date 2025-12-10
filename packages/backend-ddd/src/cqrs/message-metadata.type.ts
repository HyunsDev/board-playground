/**
 * @property timestamp - 이벤트 발생 시각 (Unix Timestamp)
 * @property correlationId - 요청 Id requestId 사용
 * @property causationType - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 타입 (ex. "auth.command.login" | "auth.command.register" )
 * @property causationId - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 ID
 * @property userId - 이벤트를 발생시킨 User의 Id
 */
export type AbstractMessageMetadata<CausationCode extends string> = {
  readonly createdAt: number | null;
  readonly correlationId: string | null;
  readonly causationType: CausationCode | null;
  readonly causationId: string | null;
  readonly userId: string | null;
};

export type AbstractCreateMessageMetadata<CausationCode extends string> = Omit<
  AbstractMessageMetadata<CausationCode>,
  'createdAt'
>;
