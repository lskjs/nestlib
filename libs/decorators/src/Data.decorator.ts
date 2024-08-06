import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { validateAndThrow } from './utils/validateAndThrow.js';

/**
 * Decorator for extracting and validating data from a request.
 * @param data - Data for extraction and validation.
 * @param data.Dto - DTO class for data validation.
 * @param data.key - The key to search for data in the request.
 * @returns Data from the request.
 * @throws Validation errors.
 * @example
 * ```ts
 * @Post('with-dto')
 * async createWithDto(@Data(MyDto) data: MyDto) {
 *  // Data is validated and transformed into an instance of MyDto
 *  return data;
 * }
 *
 * @Post('with-dto-and-key')
 * async createWithDtoAndKey(@Data({ Dto: MyDto, key: 'body' }) data: MyDto) {
 *  // Data is validated and transformed into an instance of MyDto from body
 *  return data;
 * }
 *
 * @Post('with-key')
 * async createWithKey(@Data({ key: 'query' }) data: any) {
 *  // Data is extracted from query without transformation and validation
 *  return data;
 * }
 *
 * @Post('without-dto-or-key')
 * async createWithoutDtoOrKey(@Data() data: any) {
 *  // Data is extracted from query and body without transformation and validation
 *  return data;
 * }
 * ```
 */

export const Data = createParamDecorator(async (props: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const raw = { ...request.query, ...request.body };

  let Dto;
  let key;
  if (typeof props === 'function') {
    Dto = props;
  } else if (typeof props === 'string') {
    key = props;
  }
  if (props?.Dto) {
    Dto = props.Dto;
  }
  if (props?.key) {
    key = props.key;
  }

  const data = key ? raw[key] : raw;

  if (!Dto) return data;

  const res = plainToInstance(Dto, data, { enableImplicitConversion: true });
  await validateAndThrow(res);
  return res;
});
