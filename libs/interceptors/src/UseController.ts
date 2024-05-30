/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators, Controller, NestInterceptor, UseInterceptors } from '@nestjs/common';

import { ErrorInterceptor as DefaultErrorInterceptor } from './ErrorInterceptor.js';
import { ResponseInterceptor as DefaultResponseInterceptor } from './ResponseInterceptor.js';

type UseControllerOptions = {
  ResponseInterptor?: Function | NestInterceptor<any, any> | null;
  ErrorInterceptor?: Function | NestInterceptor<any, any> | null;
  interceptors?: (Function | NestInterceptor<any, any>)[];
};

export function UseController(
  path: string | string[],
  {
    ResponseInterptor: anyReponseInterceptor = DefaultResponseInterceptor,
    ErrorInterceptor: anyErrorInterceptor = DefaultErrorInterceptor,
    interceptors = [],
  }: UseControllerOptions = {},
) {
  const mergeInterceptors = [anyReponseInterceptor, anyErrorInterceptor, ...interceptors].filter(
    Boolean,
  ) as (Function | NestInterceptor<any, any>)[];

  return applyDecorators(Controller(path), UseInterceptors(...mergeInterceptors));
}
