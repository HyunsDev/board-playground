import { Module } from '@nestjs/common';

import { TestContractsController } from './test-contracts.controller';

@Module({
  controllers: [TestContractsController],
})
export class TestContractsModule {}
