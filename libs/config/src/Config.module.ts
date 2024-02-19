import { existsSync } from 'node:fs';

import { loadConfigSync } from '@lsk4/config';
import { Err } from '@lsk4/err';
import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';

import { ConfigService } from './Config.service.js';
import { getConfigServiceToken } from './tokens.js';
import type { ConfigModuleOptions } from './types.js';

@Global()
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const { ns, name, key, ...loadConfigOptions } = options;

    const cwd = options.cwd || process.cwd();
    const envFilePath = ['.env', '../.env', '../../.env']
      .map((f) => `${cwd}/${f}`)
      .find((f) => existsSync(f));

    // TODO: may be
    // dotenv.config({ path: envFilePath });

    const _ConfigService = {
      provide: getConfigServiceToken(ns),
      useExisting: ConfigService,
    };

    return {
      imports: [
        NestConfigModule.forRoot({ envFilePath }),
        NestConfigModule.forRoot({
          load: [
            () => {
              const { config } = loadConfigSync<any>(name || '.env', loadConfigOptions);
              if (!key) return config;
              if (typeof key === 'string') return config?.[key];
              if (typeof key === 'function') return key(config);
              throw new Err('Invalid keyOrFn');
            },
          ],
          isGlobal: true,
          expandVariables: true,
        }),
      ],
      module: ConfigModule,
      providers: [ConfigService, _ConfigService, NestConfigService],
      exports: [ConfigService, _ConfigService, NestConfigService],
    };
  }
}
