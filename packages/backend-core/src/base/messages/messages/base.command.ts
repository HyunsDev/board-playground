import {
  AbstractCommand,
  AbstractCommandProps,
  DomainError,
  DomainResultAsync,
  RESULT_TYPE_SYMBOL,
} from '@workspace/backend-ddd';
import { CausationCode, CommandCode, DomainCode, ModelId } from '@workspace/domain';

import { DrivenMessageMetadata } from '../message-metadata';

export type BaseCommandProps<T> = AbstractCommandProps<T>;

/**
 * BaseCommand는 모든 커맨드의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 커맨드는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 커맨드의 데이터와 메타데이터를 포함하는 타입
 * @template R - 커맨드 핸들러의 반환 타입
 * @template O - 커맨드 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseCommand<
  TProps extends BaseCommandProps<unknown>,
  TOk,
  TRes extends DomainResultAsync<TOk, DomainError>,
> extends AbstractCommand<CausationCode, DomainCode, CommandCode, TProps, TOk, TRes> {
  static readonly code: CommandCode;

  declare [RESULT_TYPE_SYMBOL]: TRes;

  constructor(resourceId: ModelId | null, data: TProps['data'], metadata?: DrivenMessageMetadata) {
    super(resourceId, data, metadata);
  }
}
