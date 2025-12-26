import { MessageResult } from '@workspace/backend-ddd';

import { BaseCommand, BaseJobProps } from '../messages';

export interface ICommandHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCommand extends BaseCommand<BaseJobProps<any>, any, any>,
> {
  execute(command: TCommand): MessageResult<TCommand>;
}
