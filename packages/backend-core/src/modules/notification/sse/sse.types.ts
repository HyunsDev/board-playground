import { MessageEvent } from '@nestjs/common';
import z from 'zod';

import { SSEMessage } from '@workspace/common';

export const SseScopeEnum = {
  Broadcast: 'BROADCAST',
  User: 'USER',
} as const;
export type SseScopeEnum = typeof SseScopeEnum;
export type SseScope = (typeof SseScopeEnum)[keyof typeof SseScopeEnum];

export const SseEmitOptionsSchema = z.object({
  scope: z.enum(SseScopeEnum),
  targets: z.array(z.string()).optional(),
  event: z.string(),
  payload: z.any(),
  createdAt: z.iso.datetime(),
});

export type SseEmitOptions = z.infer<typeof SseEmitOptionsSchema>;

export interface SseClientMetadata {
  sessionId: string;
  connectedAt: Date;
  userAgent?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SseMessageEvent = MessageEvent & Omit<SSEMessage<string, any>, 'event'>;
