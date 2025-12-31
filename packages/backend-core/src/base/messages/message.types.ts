import { DomainCode, MessageCode, UserId } from '@workspace/domain';

export type BaseMessageGenerics<TMessageCode extends MessageCode> = Readonly<{
  TCausationType: MessageCode;
  TResourceCode: DomainCode;
  TMessageCode: TMessageCode;
  TUserId: UserId;
}>;
