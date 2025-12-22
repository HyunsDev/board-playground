import { registerAs } from '@nestjs/config';
import z from 'zod';

const discordWebhookConfigSchema = z.object({
  DISCORD_WEBHOOK_URL_TEST: z.url(),
});

export const discordWebhookConfig = registerAs('discordWebhook', () => {
  const parsed = discordWebhookConfigSchema.parse(process.env);
  return {
    discordWebhookUrlTest: parsed.DISCORD_WEBHOOK_URL_TEST,
  };
});

export type DiscordWebhookConfig = ReturnType<typeof discordWebhookConfig>;
