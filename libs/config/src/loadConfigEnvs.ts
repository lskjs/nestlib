import { getEnvConfig } from './getEnvConfig';
import { PropsFn } from './types';

const get = (obj: any, key: string) => (key ? obj[key] : obj);

export const loadConfigEnvs = (path: string | string[], keyOrFn?: string | PropsFn) => ({
  load: [
    () => {
      const config = getEnvConfig(path);
      if (typeof keyOrFn === 'function') return keyOrFn(config);
      if (!keyOrFn) return config;
      return get(config, keyOrFn);
    },
  ],
  isGlobal: true,
  expandVariables: true,
});

export default loadConfigEnvs;
