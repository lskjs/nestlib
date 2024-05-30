/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators, NestInterceptor, UseInterceptors } from '@nestjs/common';

import { ErrorInterceptor } from './ErrorInterceptor.js';
import { ResponseInterceptor } from './ResponseInterceptor.js';

export function UseAnyInterceptor(...interceptors: (Function | NestInterceptor<any, any>)[]) {
  return applyDecorators(UseInterceptors(ResponseInterceptor, ErrorInterceptor, ...interceptors));
}
