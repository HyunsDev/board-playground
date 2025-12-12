import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAgent = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.get('user-agent');
});
