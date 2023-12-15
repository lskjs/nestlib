import type { ILogger } from '@lsk4/log';
import { createLogger } from '@lsk4/log';
import { LogContext, Logger, LoggerNamespace, LoggerOptions } from '@mikro-orm/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loggerFactory = (options: LoggerOptions): Logger => {
  const cache: Record<string, ILogger> = {};
  const getLogger = (ns: LoggerNamespace) => {
    if (!cache[ns]) cache[ns] = createLogger(`orm:${ns}`);
    return cache[ns];
  };
  return {
    logQuery(context: LogContext) {
      getLogger('query').trace(...[context.query, context.params].filter(Boolean));
    },
    log(ns: LoggerNamespace, message: string) {
      getLogger(ns).debug(message);
    },
    error(ns: LoggerNamespace, message: string) {
      getLogger(ns).error(message);
    },
    warn(ns: LoggerNamespace, message: string) {
      getLogger(ns).warn(message);
    },
    setDebugMode() {},
    isEnabled() {
      return true;
    },
  };
};
