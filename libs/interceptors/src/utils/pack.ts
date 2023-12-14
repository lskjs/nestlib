import { isPlainObject, omit } from '@lsk4/algos';
import { ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';

export function pack(context: ExecutionContext, raw: any, info?: any) {
  const response = context.switchToHttp().getResponse<Response>();
  const status = (info.status || raw?.__status) ?? null;
  let isJson: boolean;
  let resultWrap;
  let data;
  if (typeof raw?.__raw !== 'undefined') {
    resultWrap = false;
    isJson = false;
    data = raw.__raw;
  } else {
    resultWrap = !(raw?.__pack ?? false);
    isJson = true;
    if (isPlainObject(raw)) {
      data = omit(raw, ['__pack', '__raw', '__log', '__status']);
    } else if (raw instanceof Error) {
      throw raw;
    } else if (typeof raw === 'function') {
      data = {};
    } else {
      data = raw;
    }
  }
  if (!data) data = {};
  const code = resultWrap ? info.code : data.code;
  let message = resultWrap ? info.message : data.message;
  if (message === code) message = undefined;
  let result;
  let resultType;
  if (resultWrap) {
    resultType = 'object';
    result = {
      ok: 1,
      code,
      message,
      data,
    };
  } else if (typeof data === 'string') {
    resultType = 'string';
    result = data;
    // TODO: other types
  } else {
    resultType = 'object';
    result = {
      ...data,
      code,
      message,
    };
  }
  if (status) {
    response.status(status);
  }
  // config.debug instead of true
  if (resultWrap && true) {
    if (info.err) {
      result.err = info.err;
    }
    if (info.debug) {
      result.debug = info.debug;
    }
    if (info.stack) {
      result.stack = info.stack;
    }
  }

  if (!isJson) {
    return result;
  }
  if (!context.switchToHttp().getResponse().getHeader('content-type')) {
    response.setHeader('content-type', 'application/json');
  }
  if (resultType === 'string') return result;
  // TODO: fast-safe-stringify?
  return JSON.stringify(result);
}
