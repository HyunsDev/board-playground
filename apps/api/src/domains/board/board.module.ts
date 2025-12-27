import { Module, Provider } from '@nestjs/common';

import { CreateBoardCommandHandler } from './application/commands/create-board.command';
import { UpdateBoardCommandHandler } from './application/commands/update-board.command';
import { BoardRepositoryPort } from './domain';
import { BoardMapper } from './infra/board.mapper';
import { BoardRepository } from './infra/board.repository';
import { BoardDtoMapper } from './interface/board.dto.mapper';
import { BoardHttpController } from './interface/board.http.controller';
import { ManagerFacadeModule } from '../manager/manager.facade.module';

const commandHandlers = [CreateBoardCommandHandler, UpdateBoardCommandHandler];
const repositories: Provider[] = [
  {
    provide: BoardRepositoryPort,
    useClass: BoardRepository,
  },
];
const mappers = [BoardMapper, BoardDtoMapper];

@Module({
  imports: [ManagerFacadeModule],
  providers: [...mappers, ...commandHandlers, ...repositories],
  controllers: [BoardHttpController],
  exports: [...mappers],
})
export class BoardModule {}
