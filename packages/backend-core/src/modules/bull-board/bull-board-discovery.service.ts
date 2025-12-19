import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'; // OnModuleInit -> OnApplicationBootstrap 변경 권장
import { DiscoveryService, HttpAdapterHost } from '@nestjs/core';
import { Queue } from 'bullmq';

import { DomainCodeEnums } from '@workspace/domain';

import { systemLog, SystemLogActionEnum } from '../logging';

const BullBoardBasePath = '/_devtools/queues';

@Injectable()
export class BullBoardDiscoveryService implements OnApplicationBootstrap {
  private logger = new Logger(BullBoardDiscoveryService.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly httpAdapterHost: HttpAdapterHost, // 1. HttpAdapterHost 주입
  ) {}

  onApplicationBootstrap() {
    this.setupBullBoard();
  }

  private setupBullBoard() {
    // 1. 애플리케이션의 모든 Provider 스캔 및 큐 필터링
    const providers = this.discoveryService.getProviders();
    const queues = providers
      .filter((wrapper) => wrapper.instance && wrapper.instance instanceof Queue)
      .map((wrapper) => wrapper.instance as Queue);

    const uniqueQueues = [...new Set(queues)];
    const boardAdapters = uniqueQueues.map((queue) => new BullMQAdapter(queue));

    // 2. BullBoard Fastify Adapter 생성
    const serverAdapter = new FastifyAdapter();

    // 3. BullBoard 생성
    createBullBoard({
      queues: boardAdapters,
      serverAdapter: serverAdapter,
    });

    const basePath = BullBoardBasePath;
    serverAdapter.setBasePath(basePath);

    const { httpAdapter } = this.httpAdapterHost;
    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      const fastifyApp = httpAdapter.getInstance();

      fastifyApp.register(serverAdapter.registerPlugin(), {
        prefix: basePath,
      });

      this.logger.log(
        systemLog(DomainCodeEnums.System.Devtools, SystemLogActionEnum.DevtoolsUsage, {
          msg: `Registered ${uniqueQueues.length} queues at ${basePath}`,
        }),
      );
    }
  }
}
