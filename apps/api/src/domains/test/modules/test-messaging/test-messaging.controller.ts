import { Controller, Get, Logger } from '@nestjs/common';
import { ok } from 'neverthrow';

import {
  HandleIntegrationEvent,
  HandleRpc,
  IntegrationEventPublisherPort,
  MessageContext,
  Pub,
  Public,
  Rpc,
  RpcClient,
  Trigger,
} from '@workspace/backend-core';
import { MessageResult } from '@workspace/backend-ddd';
import { TriggerCodeEnum } from '@workspace/domain';

import { TestPub } from '../../messages/test.pub';
import { TestRpc } from '../../messages/test.rpc';

@Public()
@Controller('_test')
export class TestController {
  readonly logger = new Logger(TestController.name);

  constructor(
    private readonly integrationEventPublisher: IntegrationEventPublisherPort,
    private readonly rpcClient: RpcClient,
    private readonly messageContext: MessageContext,
  ) {}

  @Get('pub')
  @Trigger(TriggerCodeEnum.Http)
  async pub() {
    void this.messageContext.createMetadata('system:infra:trg:test');
    void this.integrationEventPublisher.publish(
      new TestPub(null, {
        message: 'This is a test message from TestController.pub',
      }),
    );
    return { message: '펑!' };
  }

  @HandleIntegrationEvent(TestPub)
  async handleTestPub(@Pub() pub: TestPub) {
    this.logger.debug(`Received TestPub with message: ${pub.data.message}`);
  }

  @Get('ping')
  @Trigger(TriggerCodeEnum.Http)
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
    this.logger.debug(`Received TestRpc with message: ${rpc.data.ping}`);

    return ok({ pong: 'Pong from TestController.handleTestRpc' });
  }
}
