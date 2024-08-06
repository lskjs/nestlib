import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { validateAndThrow } from './utils/validateAndThrow.js';

/**
 * Decorator for extracting and validating data from a request.
 * @param data - Data for extraction and validation.
 * @param data.Dto - DTO class for data validation.
 * @param data.key - The key or keys to search for data in the request.
 * @param data.keys - OPTIONAL The key or keys to search for data in the request.
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
 * async createWithDtoAndKey(@Data({ Dto: MyDto, key: 'props' }) data: MyDto) {
 *  // Data is validated and transformed into an instance of MyDto from body
 *  return data;
 * }
 *
 * }
 *
 * @Post('with-key-only')
 * async createWithDtoAndKey(@Data('props') data: MyDto) {
 *  // Data is validated and transformed into an instance of MyDto from body
 *  return data;
 * }
 *
 * @Post('with-dto-and-keys')
 * async createWithKeys(@Data({ Dto: MyDto, key: ['params', 'props'] }) data: any) {
 *  // Data is extracted from query and body without transformation and validation
 *  return data;
 * }
 *
 * @Post('with-keys-only')
 * async createWithKeys(@Data(['params', 'props']) data: any) {
 *  // Data is extracted from query and body without transformation and validation
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
  let keys = [];

  if (typeof props === 'function') {
    Dto = props;
  } else if (typeof props === 'string') {
    keys = [props];
  } else if (Array.isArray(props)) {
    keys = props;
  } else {
    if (props?.Dto) {
      Dto = props.Dto;
    }
    const rawKeys = props?.key || props?.keys;
    if (rawKeys) {
      keys = Array.isArray(rawKeys) ? props.key : [props.key];
    }
  }

  let data = raw;
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    if (raw[key] !== undefined) {
      data = raw[key];
      break;
    }
  }

  if (!Dto) return data;

  const res = plainToInstance(Dto, data, { enableImplicitConversion: true });
  await validateAndThrow(res);
  return res;
});
