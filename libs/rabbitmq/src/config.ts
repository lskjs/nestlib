import { isDev } from '@lsk4/env';
import { createLogger } from '@lsk4/log';

// NOTE: Может сделать глобальной переменной?
export const rmqConfig = {};
export const rmqDeliveryAttempts: Record<string, any> = {};

export const defaultRmqConfig = {
  errDelay: isDev ? 1000 : 100,
  maxAttempts: isDev ? 3 : 20,
  isLog: isDev,
};

const log = createLogger({ ns: 'rmq:config' });

export const setRmqConfig = (config: any) => {
  log.trace('[set]', config);
  Object.assign(rmqConfig, config);
};
export const getRmqConfig = (deepKey: string) => {
  const keys = deepKey.split('.');
  let value = rmqConfig as any;
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    value = value?.[key];
  }
  log.trace('[config]', deepKey, value);
  return value as any;
};

setRmqConfig(defaultRmqConfig);
