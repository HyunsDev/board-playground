import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { CommandDispatcherPort, QueryDispatcherPort, Token } from '@workspace/backend-core';
import { apiErr, apiOk, matchPublicError } from '@workspace/backend-ddd';
import { ApiErrors, contract } from '@workspace/contract';
import { TokenPayload } from '@workspace/domain';

import { ManagerDtoMapper } from './manager.dto.mapper';
import { AppointSubManagerCommand } from '../application/commands/appoint-sub-manager.command';
import { DismissSubManagerCommand } from '../application/commands/dismiss-sub-manager.command';
import { TransferMainManagerCommand } from '../application/commands/transfer-main-manager.command';
import { ListBoardManagersQuery } from '../application/queries/list-board-managers.query';
import { ListUserManagersQuery } from '../application/queries/list-user-managers.query';

@Controller()
export class ManagerHttpController {
  constructor(
    private readonly commandDispatcher: CommandDispatcherPort,
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly dtoMapper: ManagerDtoMapper,
  ) {}

  @TsRestHandler(contract.board.manager.list)
  async listBoardManagers() {
    return tsRestHandler(contract.board.manager.list, async ({ params }) => {
      const result = await this.queryDispatcher.execute(
        new ListBoardManagersQuery({ boardSlug: params.boardSlug }),
      );

      return result.match(
        (managers) =>
          apiOk(200, {
            managers: this.dtoMapper.toDtoWithUserMany(managers),
          }),
        (error) => matchPublicError(error, {}),
      );
    });
  }

  @TsRestHandler(contract.user.me.managers.list)
  async listUserManagers() {
    return tsRestHandler(contract.user.me.managers.list, async ({ params }) => {
      const result = await this.queryDispatcher.execute(
        new ListUserManagersQuery({ userId: params.userId }),
      );

      return result.match(
        (managers) =>
          apiOk(200, {
            managers: this.dtoMapper.toDtoWithBoardMany(managers),
          }),
        (error) => matchPublicError(error, {}),
      );
    });
  }

  @TsRestHandler(contract.board.manager.appoint)
  async appointBoardManager(@Token() token: TokenPayload) {
    return tsRestHandler(contract.board.manager.appoint, async ({ params, body }) => {
      const result = await this.commandDispatcher.execute(
        new AppointSubManagerCommand({
          boardSlug: params.boardSlug,
          targetUserEmail: body.targetUserEmail,
          actorUserId: token.sub,
        }),
      );

      return result.match(
        (manager) =>
          apiOk(200, {
            manager: this.dtoMapper.toDtoWithUser(manager),
          }),
        (error) =>
          matchPublicError(error, {
            InvalidTargetManager: () => apiErr(ApiErrors.Manager.InvalidTargetManager),
            ManagerNotFound: () => apiErr(ApiErrors.Manager.NotFound),
            UserNotFound: () => apiErr(ApiErrors.User.NotFound),
            UserNotMainManager: () => apiErr(ApiErrors.Manager.NotMainManager),
            BoardNotFound: () => apiErr(ApiErrors.Board.NotFound),
          }),
      );
    });
  }

  @TsRestHandler(contract.board.manager.dismiss)
  async dismissBoardManager(@Token() token: TokenPayload) {
    return tsRestHandler(contract.board.manager.dismiss, async ({ params }) => {
      const result = await this.commandDispatcher.execute(
        new DismissSubManagerCommand({
          targetManagerUserId: params.userId,
          actManagerUserId: token.sub,
          boardSlug: params.boardSlug,
        }),
      );

      return result.match(
        () => apiOk(204, undefined),
        (error) =>
          matchPublicError(error, {
            InvalidTargetManager: () => apiErr(ApiErrors.Manager.InvalidTargetManager),
            ManagerNotFound: () => apiErr(ApiErrors.Manager.NotFound),
            CannotDismissMainManager: () => apiErr(ApiErrors.Manager.CannotDismissMainManager),
            UserNotMainManager: () => apiErr(ApiErrors.Manager.NotMainManager),
          }),
      );
    });
  }

  @TsRestHandler(contract.board.manager.transferMainManager)
  async transferMainManager(@Token() token: TokenPayload) {
    return tsRestHandler(contract.board.manager.transferMainManager, async ({ params }) => {
      const result = await this.commandDispatcher.execute(
        new TransferMainManagerCommand({
          boardSlug: params.boardSlug,
          fromManagerUserId: token.sub,
          toManagerUserId: params.userId,
        }),
      );

      return result.match(
        () => apiOk(204, undefined),
        (error) =>
          matchPublicError(error, {
            InvalidTargetManager: () => apiErr(ApiErrors.Manager.InvalidTargetManager),
            ManagerNotFound: () => apiErr(ApiErrors.Manager.NotFound),
            ManagerCannotTransferToSelf: () => apiErr(ApiErrors.Manager.CannotTransferToSelf),
            UserNotMainManager: () => apiErr(ApiErrors.Manager.NotMainManager),
            ManagerNotSubManager: () => apiErr(ApiErrors.Manager.InvalidTargetManager),
          }),
      );
    });
  }
}
