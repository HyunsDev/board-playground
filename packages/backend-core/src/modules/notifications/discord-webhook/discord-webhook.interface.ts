import { ModuleMetadata, InjectionToken } from '@nestjs/common';

export interface WebhookOption {
  name: string;
  url: string;
  defaultUsername?: string;
  defaultAvatarUrl?: string;
}

export interface DiscordWebhookModuleOptions {
  webhooks: WebhookOption[];
}

export interface DiscordWebhookModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: unknown[]
  ) => Promise<DiscordWebhookModuleOptions> | DiscordWebhookModuleOptions;
  inject?: InjectionToken[];
}
