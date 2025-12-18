import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common'; // OnModuleInit -> OnApplicationBootstrap 변경 권장
import { DiscoveryService, HttpAdapterHost } from '@nestjs/core';
import { Queue } from 'bullmq';

@Injectable()
export class BullBoardDiscoveryService implements OnApplicationBootstrap {
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

    // 4. [핵심] 실제 Fastify 인스턴스에 라우트 등록
    const basePath = '/_devtools/queues'; // 원하시는 경로
    serverAdapter.setBasePath(basePath);

    const { httpAdapter } = this.httpAdapterHost;
    // Fastify 인스턴스인지 확인 (Express 등을 쓸 경우 대비)
    if (httpAdapter && httpAdapter.getType() === 'fastify') {
      const fastifyApp = httpAdapter.getInstance();

      // Fastify에 플러그인 등록
      fastifyApp.register(serverAdapter.registerPlugin(), {
        prefix: basePath,
      });

      console.log(`[BullBoard] Registered ${uniqueQueues.length} queues at ${basePath}`);
    }
  }
}
