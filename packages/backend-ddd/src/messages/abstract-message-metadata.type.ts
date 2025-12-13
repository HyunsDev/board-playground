/**
 * @property createdAt - 이벤트 발생 시각 (Unix Timestamp)
 * @property correlationId - 요청 Id requestId 사용
 * @property causationType - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 타입 코드
 * @property causationId - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 ID
 * @property resourceType - 이벤트와 관련된 리소스의 타입 코드
 * @property resourceId - 이벤트와 관련된 리소스의 Id
 * @property userId - 이벤트를 발생시킨 User의 Id
 */
export type AbstractMessageMetadata<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
> = {
  readonly createdAt: number | null;
  readonly correlationId: string | null;
  readonly causationType: CausationCodeType | null;
  readonly causationId: string | null;
  readonly resourceType: ResourceCodeType | null;
  readonly resourceId: string | null;
  readonly userId: string | null;
};

export type AbstractCreateMessageMetadata<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
> = Omit<
  AbstractMessageMetadata<CausationCodeType, ResourceCodeType>,
  'createdAt' | 'resourceId' | 'resourceType'
>;
