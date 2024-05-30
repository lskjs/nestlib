import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { validateAndThrow } from './utils/validateAndTrow';

// TODO: add unnessary Dto
// TODO: add pick one argument @Data(Dto, ['_id']) like @Query(['_id'])

export const Data = createParamDecorator(async (Dto: any, ctx: ExecutionContext) => {
  // TODO: add rabbitmq support
  const request = ctx.switchToHttp().getRequest();
  const data = { ...request.query, ...request.body };
  const params = plainToInstance(Dto, data, { enableImplicitConversion: true });
  await validateAndThrow(params);
  return params;
});
