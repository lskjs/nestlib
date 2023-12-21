import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryOrBody = createParamDecorator((property: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const queryParam = request.query[property];
  const bodyParam = request.body[property];
  return queryParam || bodyParam;
});
