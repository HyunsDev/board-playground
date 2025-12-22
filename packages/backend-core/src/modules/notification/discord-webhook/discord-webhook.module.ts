import { DynamicModule, Module, Provider } from '@nestjs/common';

import { DiscordWebhookModuleAsyncOptions } from './discord-webhook.interface';
import { DiscordWebhookService, WEBHOOK_MODULE_OPTIONS } from './discord-webhook.service';

import { HttpClientModule } from '@/modules/messaging';

@Module({})
export class DiscordWebhookModule {
  static forAsync(options: DiscordWebhookModuleAsyncOptions): DynamicModule {
    const asyncProvider: Provider = {
      provide: WEBHOOK_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: DiscordWebhookModule,
      imports: [HttpClientModule, ...(options.imports || [])],
      providers: [asyncProvider, DiscordWebhookService],
      exports: [DiscordWebhookService],
    };
  }
}
