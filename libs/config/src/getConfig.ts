import { pick } from '@lsk4/algos';
import { Err } from '@lsk4/err';

import { ConfigModule } from './Config.module.js';
import { ConfigService } from './Config.service.js';
import type { PropsFn } from './types.js';

export const getConfig = (path: string, fields?: string[] | PropsFn) => ({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const res = configService.get(path);
    if (!res) throw new Err(`!config: ${path}`, { path });
    if (Array.isArray(fields)) return pick(res, fields);
    if (typeof fields === 'function') return fields(res);
    return res;
  },
  inject: [ConfigService],
});

export default getConfig;
