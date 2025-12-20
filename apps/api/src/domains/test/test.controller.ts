import { Controller, Get, Logger } from '@nestjs/common';
import { ok } from 'neverthrow';

import {
  HandlePub,
  HandleRpc,
  IntegrationEventPublisherPort,
  MessageContext,
  Pub,
  Public,
  Rpc,
  RpcClient,
} from '@workspace/backend-core';
import { MessageResult } from '@workspace/backend-ddd';

import { TestPub } from './messages/test.pub';
import { TestRpc } from './messages/test.rpc';
import { TestService } from './test.service';

@Public()
@Controller('_test')
export class TestController {
  readonly logger = new Logger(TestController.name);

  constructor(
    private readonly testService: TestService,
    private readonly integrationEventPublisher: IntegrationEventPublisherPort,
    private readonly rpcClient: RpcClient,
    private readonly messageContext: MessageContext,
  ) {}

  @Get('pub')
  async pub() {
    void this.messageContext.createMetadata('system:infra:trg:test');
    void this.integrationEventPublisher.publish(
      new TestPub(null, {
        message: 'This is a test message from TestController.pub',
      }),
    );
    return { message: '펑!' };
  }

  @HandlePub(TestPub)
  async handleTestPub(@Pub() pub: TestPub) {
    this.logger.log(`Received TestPub with message: ${pub.data.message}`);
  }

  @Get('ping')
  async ping() {
    void this.messageContext.createMetadata('system:infra:trg:test');
    const result = await this.rpcClient.send(
      new TestRpc(null, {
        ping: 'Ping from TestController.ping',
      }),
    );

    return { result: result._unsafeUnwrap() };
  }

  @HandleRpc(TestRpc)
  async handleTestRpc(@Rpc() rpc: TestRpc): Promise<MessageResult<TestRpc>> {
    this.logger.log(`Received TestRpc with message: ${rpc.data.ping}`);

    return ok({ pong: 'Pong from TestController.handleTestRpc' });
  }
}
