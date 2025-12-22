import { ModuleMetadata, InjectionToken } from '@nestjs/common';

export interface WebhookOption {
  url: string;
  defaultUsername?: string;
  defaultAvatarUrl?: string;
}

export interface DiscordWebhookModuleOptions<TName extends string = string> {
  webhooks: Record<TName, WebhookOption>;
}

export interface DiscordWebhookModuleAsyncOptions<TName extends string = string> extends Pick<
  ModuleMetadata,
  'imports'
> {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<DiscordWebhookModuleOptions<TName>> | DiscordWebhookModuleOptions<TName>;
  inject?: InjectionToken[];
}
