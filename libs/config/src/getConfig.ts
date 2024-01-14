import { pick } from '@lsk4/algos';
import { Err } from '@lsk4/err';
import { ConfigService as NestConfigService } from '@nestjs/config';

// ConfigService
import { ConfigModule } from './ConfigModule';
import { PropsFn } from './types';

export const getConfig = (path: string, fields?: string[] | PropsFn) => ({
  imports: [ConfigModule],
  useFactory: (configService: NestConfigService) => {
    const res = configService.get(path);
    if (!res) throw new Err(`!config: ${path}`, { path });
    if (Array.isArray(fields)) return pick(res, fields);
    if (typeof fields === 'function') return fields(res);
    return res;
  },
  inject: [NestConfigService],
});

export default getConfig;
