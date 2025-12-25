import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { CommandDispatcherPort, QueryDispatcherPort } from '@workspace/backend-core';
import { apiOk, matchPublicError } from '@workspace/backend-ddd';
import { contract } from '@workspace/contract';

import { ManagerDtoMapper } from './manager.dto.mapper';
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
}
