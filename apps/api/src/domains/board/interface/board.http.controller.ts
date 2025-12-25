import { Controller } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { CommandDispatcherPort, QueryDispatcherPort, Token } from '@workspace/backend-core';
import { apiErr, apiOk, matchPublicError } from '@workspace/backend-ddd';
import { ApiErrors, contract } from '@workspace/contract';
import { TokenPayload } from '@workspace/domain';

import { BoardDtoMapper } from './board.dto.mapper';
import { CreateBoardCommand } from '../application/commands/create-board.command';
import { UpdateBoardCommand } from '../application/commands/update-board.command';

@Controller()
export class BoardHttpController {
  constructor(
    private readonly commandDispatcher: CommandDispatcherPort,
    private readonly queryDispatcher: QueryDispatcherPort,
    private readonly dtoMapper: BoardDtoMapper,
  ) {}

  @TsRestHandler(contract.board.create)
  async createBoard(@Token() token: TokenPayload) {
    return tsRestHandler(contract.board.create, async ({ body }) => {
      const result = await this.commandDispatcher.execute(
        new CreateBoardCommand({
          slug: body.slug,
          name: body.name,
          description: body.description,
          managerId: token.sub,
        }),
      );

      return result.match(
        (board) =>
          apiOk(201, {
            board: this.dtoMapper.toDto(board),
          }),
        (error) =>
          matchPublicError(error, {
            BoardSlugAlreadyExists: () => apiErr(ApiErrors.Board.SlugAlreadyExists),
          }),
      );
    });
  }

  @TsRestHandler(contract.board.update)
  async updateBoard(@Token() token: TokenPayload) {
    return tsRestHandler(contract.board.update, async ({ params, body }) => {
      const result = await this.commandDispatcher.execute(
        new UpdateBoardCommand({
          boardSlug: params.boardSlug,
          name: body.name,
          description: body.description,
          actorId: token.sub,
        }),
      );

      return result.match(
        (board) =>
          apiOk(200, {
            board: this.dtoMapper.toDto(board),
          }),
        (error) =>
          matchPublicError(error, {
            BoardNotFound: () => apiErr(ApiErrors.Board.NotFound),
            UserNotManager: () => apiErr(ApiErrors.Manager.NotManager),
          }),
      );
    });
  }
}
