import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { CommandDispatcherPort, MessageContext, Public, Trigger } from '@workspace/backend-core';
import { apiOk, matchPublicError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';
import { TriggerCodeEnum } from '@workspace/domain';

import { ForceLoginCommand } from './commands/force-login.command';
import { ForceRegisterCommand } from './commands/force-register.command';
import { ResetDBCommand } from './commands/reset-db.command';

@Controller()
export class DevtoolsController {
  constructor(
    private readonly commandDispatcher: CommandDispatcherPort,
    private readonly messageContext: MessageContext,
  ) {}

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.devtools.forceRegister)
  @Public()
  async forceRegister() {
    return tsRestHandler(contract.devtools.forceRegister, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new ForceRegisterCommand({
          email: body.email,
          username: body.username,
          nickname: body.nickname,
        }),
      );
      return result.match(
        (tokens) => apiOk(200, tokens),
        (error) =>
          matchPublicError(error, {
            UserEmailAlreadyExists: () => apiErr(ApiErrors.User.EmailAlreadyExists),
            UserUsernameAlreadyExists: () => apiErr(ApiErrors.User.UsernameAlreadyExists),
          }),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.devtools.forceLogin)
  @Public()
  async forceLogin() {
    return tsRestHandler(contract.devtools.forceLogin, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new ForceLoginCommand({
          email: body.email,
        }),
      );
      return result.match(
        (tokens) => apiOk(200, tokens),
        (error) =>
          matchPublicError(error, {
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
          }),
      );
    });
  }

  @Trigger(TriggerCodeEnum.Http)
  @TsRestHandler(contract.devtools.resetDB)
  @Public()
  async resetDB() {
    return tsRestHandler(contract.devtools.resetDB, async () => {
      const result = await this.commandDispatcher.execute(new ResetDBCommand(undefined));
      return result.match(
        () => apiOk(200, undefined),
        () => apiOk(200, undefined),
      );
    });
  }
}
