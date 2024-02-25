import { pick } from '@lsk4/algos';
import { Err } from '@lsk4/err';

// import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from './Config.module.js';
import { ConfigService } from './Config.service.js';
import type { PropsFn } from './types.js';

// type GetConfigRes = {
//   imports: any[];
//   useFactory: (configService: ConfigService) => any;
//   inject: any[];
// };

// type GetConfigResult = DynamicModule | any;
type GetConfigResult = {
  imports: any[];
  useFactory: (configService: ConfigService) => any;
  inject: any[];
};

type GetConfig = {
  (): GetConfigResult;
  (fields?: string[] | PropsFn): GetConfigResult;
  (path: string, fields?: string[] | PropsFn): GetConfigResult;
};

export const getConfig: GetConfig = (arg1?: any, arg2?: any) => ({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    let path: string | null = null;
    let fields: string[] | PropsFn | null = null;
    if (typeof arg2 !== 'undefined') {
      path = arg1;
      fields = arg2;
    } else if (typeof arg1 !== 'undefined') {
      if (typeof arg1 === 'string') {
        path = arg1;
        fields = null;
      } else if (Array.isArray(arg1) || typeof arg1 === 'function') {
        path = null;
        fields = arg1;
      }
    }

    let subConfig: any;
    if (path) {
      subConfig = configService.get(path);
    } else {
      // TODO: найти как такое делать правильно
      // @ts-ignore
      subConfig = configService?.configService?.internalConfig;
    }
    if (!subConfig) throw new Err(`!config: ${path}`, { path });
    // console.log({ arg1, arg2 });
    // console.log('subConfig', subConfig, typeof fields === 'function', typeof fields, fields);
    if (Array.isArray(fields)) return pick(subConfig, fields);
    if (typeof fields === 'function') return fields(subConfig);
    return subConfig;
  },
  inject: [ConfigService],
});

export default getConfig;
