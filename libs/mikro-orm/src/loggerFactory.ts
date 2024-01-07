/* eslint-disable no-nested-ternary */
import type { ILogger } from '@lsk4/log';
import { createLogger } from '@lsk4/log';
// @ts-ignore
import { prettyTime } from '@lsk4/log/pretty';
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
      const { level: initLevel, query, params, took, results } = context;
      let level: 'trace' | 'debug' | 'warn' | 'error' | undefined;
      if (initLevel === 'warning') level = 'warn';
      if (initLevel === 'error') level = 'error';
      if (!level) {
        level = took! > 60000 ? 'warn' : took! > 5000 ? 'debug' : 'trace';
      }
      let info = '';
      info += took ? prettyTime(took) : '';
      if (results! > 1) info += ` [${results}]`;
      const prettyQuery = String(query)
        .replace(/^db.getCollection\('(\w+)'\)/g, '$1')
        .replace(/.limit\(1\).toArray\(\);$/g, '')
        .replace(/, \{\}\)$/g, ')');
      getLogger('query')[level](...[prettyQuery, params, info].filter(Boolean));
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
