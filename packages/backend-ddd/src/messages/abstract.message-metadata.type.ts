import { BrandId } from '@workspace/common';

import { AbstractMessageGenerics } from './message.types';

/**
 * @property createdAt - 이벤트 발생 시각 (Unix Timestamp)
 * @property correlationId - 요청 Id requestId 사용
 * @property causationType - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 타입 코드
 * @property causationId - 이 이벤트를 유발한 원인(Event, Command, Trigger)의 ID
 * @property resourceType - 이벤트와 관련된 리소스의 타입 코드
 * @property resourceId - 이벤트와 관련된 리소스의 Id
 * @property userId - 이벤트를 발생시킨 User의 Id
 */
export type AbstractMessageMetadata<T extends AbstractMessageGenerics = AbstractMessageGenerics> = {
  readonly createdAt: number | null;
  readonly correlationId: string | null;
  readonly causationType: T['TCausationType'] | null;
  readonly causationId: string | null;
  readonly resourceType: T['TResourceCode'] | null;
  readonly resourceId: BrandId | null;
  readonly userId: T['TUserId'] | null;
};

export type AbstractDrivenMessageMetadata<
  T extends AbstractMessageGenerics = AbstractMessageGenerics,
> = Omit<AbstractMessageMetadata<T>, 'createdAt' | 'resourceId' | 'resourceType'>;

export type AbstractCreateMessageMetadata<
  T extends AbstractMessageGenerics = AbstractMessageGenerics,
> = {
  readonly createdAt?: number | null;
  readonly correlationId: string | null;
  readonly causationType: T['TCausationType'] | null;
  readonly causationId: string | null;
  readonly resourceType?: T['TResourceCode'] | null;
  readonly resourceId?: BrandId | null;
  readonly userId: T['TUserId'] | null;
};
