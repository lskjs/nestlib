import type { ILogger, LoggerLevelType } from '@lsk4/log';
import { mapValues } from '@lsk4/algos';
import { createLogger } from '@lsk4/log';
import { LoggerService as NestLoggerService } from '@nestjs/common';

export type LoggerService = NestLoggerService & {
  info: (name: string, ...args: any[]) => void;
  setLogLevels: () => void;
};
export interface ILoggerOptions {
  env?: string;
  context?: string;
  level?: LoggerLevelType;
  logGroupName?: string;
  params?: any;

  ns?: string;
}
export const createNestLogger = (props: ILoggerOptions = {}): LoggerService => {
  const { level, ns } = props;
  // const log = new Logger({ level, ns });
  const mapper = {
    verbose: 'trace',
    log: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
    fatal: 'fatal',
  };

  const cache: Record<string, ILogger> = {};
  const getLogger = (ns: string) => {
    if (!cache[ns]) cache[ns] = createLogger(`nest:${ns}`, { level });
    return cache[ns];
  };

  // @ts-ignore
  const loggerService: any = mapValues(mapper, (lskLevel: LoggerLevelType) => (...args: any[]) => {
    const name = args.pop();
    const res = getLogger(name)[lskLevel](...args);
    return res;
  });

  loggerService.setLogLevels = () => {
    // log.setLevel(levels);
  };

  return loggerService as LoggerService;
};
