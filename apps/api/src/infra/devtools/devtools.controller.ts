import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { ContextService, Public } from '@workspace/backend-core';
import { apiOk, matchPublicError, apiErr } from '@workspace/backend-ddd';
import { contract, ApiErrors } from '@workspace/contract';

import { ForceLoginCommand } from './commands/force-login.command';
import { ForceRegisterCommand } from './commands/force-register.command';
import { ResetDBCommand } from './commands/reset-db.command';

@Controller()
export class DevtoolsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly contextService: ContextService,
  ) {}

  @TsRestHandler(contract.devtools.forceRegister)
  @Public()
  async forceRegister() {
    return tsRestHandler(contract.devtools.forceRegister, async ({ body }) => {
      const result = await this.commandBus.execute(
        new ForceRegisterCommand(
          {
            email: body.email,
            username: body.username,
            nickname: body.nickname,
          },
          this.contextService.getMessageMetadata(),
        ),
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

  @TsRestHandler(contract.devtools.forceLogin)
  @Public()
  async forceLogin() {
    return tsRestHandler(contract.devtools.forceLogin, async ({ body }) => {
      const result = await this.commandBus.execute(
        new ForceLoginCommand(
          {
            email: body.email,
          },
          this.contextService.getMessageMetadata(),
        ),
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

  @TsRestHandler(contract.devtools.resetDB)
  @Public()
  async resetDB() {
    return tsRestHandler(contract.devtools.resetDB, async () => {
      const result = await this.commandBus.execute(
        new ResetDBCommand(undefined, this.contextService.getMessageMetadata()),
      );
      return result.match(
        () => apiOk(200, undefined),
        () => apiOk(200, undefined),
      );
    });
  }
}
