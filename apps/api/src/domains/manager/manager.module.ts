import { Module } from '@nestjs/common';

import { AppointSubManagerCommandHandler } from './application/commands/appoint-sub-manager.command';
import { DismissSubManagerCommandHandler } from './application/commands/dismiss-sub-manager.command';
import { TransferMainManagerCommandHandler } from './application/commands/transfer-main-manager.command';
import { ManagerFacade } from './application/manager.facade';
import { ListBoardManagersQueryHandler } from './application/queries/list-board-managers.query';
import { ListUserManagersQueryHandler } from './application/queries/list-user-managers.query';
import { ManagerRepositoryPort } from './domain';
import { ManagerMapper } from './infra/manager.mapper';
import { ManagerRepository } from './infra/manager.repository';
import { BoardFacadeModule } from '../board/board.facade.module';
import { UserFacadeModule } from '../user/user.facade.module';

const CommandHandlers = [
  AppointSubManagerCommandHandler,
  DismissSubManagerCommandHandler,
  TransferMainManagerCommandHandler,
];

const queryHandlers = [ListBoardManagersQueryHandler, ListUserManagersQueryHandler];
@Module({
  imports: [BoardFacadeModule, UserFacadeModule],
  providers: [
    ...CommandHandlers,
    ...queryHandlers,
    ManagerFacade,
    {
      provide: ManagerRepositoryPort,
      useClass: ManagerRepository,
    },
    ManagerMapper,
  ],
  controllers: [],
  exports: [],
})
export class ManagerModule {}
