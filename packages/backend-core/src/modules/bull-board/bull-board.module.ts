import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { BullBoardDiscoveryService } from './bull-board-discovery.service';

@Module({
  imports: [DiscoveryModule],
  providers: [BullBoardDiscoveryService],
  exports: [],
})
export class CoreBullBoardModule {}
