import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { TokenPayload } from '@/shared/types/token-payload.type';

export const Token = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    if (!user) return null;

    return data ? user[data] : user;
  },
);
