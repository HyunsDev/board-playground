import { Module, Provider } from '@nestjs/common';

import { BoardRepositoryPort } from './domain';
import { BoardMapper } from './infra/board.mapper';
import { BoardRepository } from './infra/board.repository';
import { BoardDtoMapper } from './interface/board.dto.mapper';

const repositories: Provider[] = [
  {
    provide: BoardRepositoryPort,
    useClass: BoardRepository,
  },
];
const mappers = [BoardMapper, BoardDtoMapper];

@Module({
  imports: [],
  providers: [...mappers, ...repositories],
  controllers: [],
  exports: [...mappers],
})
export class BoardFacadeModule {}
