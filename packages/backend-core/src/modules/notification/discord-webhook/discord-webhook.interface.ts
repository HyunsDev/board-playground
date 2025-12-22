import { ModuleMetadata, InjectionToken } from '@nestjs/common';

export interface WebhookOption<TName extends string = string> {
  name: TName;
  url: string;
  defaultUsername?: string;
  defaultAvatarUrl?: string;
}

export interface DiscordWebhookModuleOptions<TName extends string = string> {
  webhooks: WebhookOption<TName>[];
}

export interface DiscordWebhookModuleAsyncOptions<TName extends string = string> extends Pick<
  ModuleMetadata,
  'imports'
> {
  useFactory: (
    ...args: unknown[]
  ) => Promise<DiscordWebhookModuleOptions<TName>> | DiscordWebhookModuleOptions<TName>;
  inject?: InjectionToken[];
}
