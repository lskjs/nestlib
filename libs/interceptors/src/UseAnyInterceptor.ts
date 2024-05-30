/* eslint-disable @typescript-eslint/ban-types */
import { applyDecorators, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { ErrorInterceptor, ResponseInterceptor } from '@nestlib/interceptors';

export function UseAnyInterceptor(...interceptors: (Function | NestInterceptor<any, any>)[]) {
  return applyDecorators(UseInterceptors(ResponseInterceptor, ErrorInterceptor, ...interceptors));
}
