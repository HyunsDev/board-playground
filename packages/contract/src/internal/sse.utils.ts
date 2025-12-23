import { createSSEMessageContract, type SSEMessageContract } from '@workspace/common';

import type z from 'zod';

type SSERoute = {
  [key: string]: SSEMessageContract<string, z.ZodTypeAny> | SSERoute;
};

const SSERouter = <const T extends SSERoute>(sses: T) => {
  return sses;
};

export const e = {
  define: createSSEMessageContract,
  router: SSERouter,
} as const;
