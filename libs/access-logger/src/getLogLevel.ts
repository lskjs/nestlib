import { LoggerLevelType } from '@lsk4/log';

import { AccessLoggerData } from './types.js';

export function getLogLevel(data: AccessLoggerData, event: 'start' | 'finish'): LoggerLevelType {
  if (data?.method === 'WS') {
    if (event === 'start') {
      return 'debug';
    }
    if (event === 'finish') {
      return 'trace';
    }
  }
  if (event === 'start') {
    return 'trace';
  }
  const status = data?.status || 200;
  const duration = data?.duration || 0;
  if (data?.err || status >= 500 || duration > 10000) {
    // server internal error or error
    return 'error';
  }
  if (status >= 400 || duration > 3000) {
    // client error
    return 'warn';
  }
  return 'debug';
}
