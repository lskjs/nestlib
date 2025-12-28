/** biome-ignore-all lint/complexity/noStaticOnlyClass: Static is ok in nest */
import { existsSync } from 'node:fs';

import { loadConfigSync } from '@lsk4/config';
import { Err } from '@lsk4/err';
import { type DynamicModule, Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { ConfigService } from './Config.service.js';
import { log } from './log.js';
import { getConfigServiceToken } from './tokens.js';
import type { ConfigModuleOptions } from './types.js';

// TODO: change loadConfigSync to async version
@Global()
@Module({})
export class ConfigModule {
  // TODO: подумать об прокидывании схемы
  // biome-ignore lint/suspicious/noExplicitAny: Type may be various
  static forRoot(options: ConfigModuleOptions<any> = {}): DynamicModule {
    const { ns, name, key, throwError: initThrowError, ...loadConfigOptions } = options;

    const cwd = options.cwd || process.cwd();
    const configFileName = name || '.env';
    // Определяем, является ли файл .env файлом (не JS/TS/JSON)
    // Файлы .env, .config (без расширения JS/TS/JSON) считаются .env файлами
    const hasJsTsJsonExt = configFileName.match(/\.(js|ts|json)$/);
    const isEnvFile =
      !hasJsTsJsonExt &&
      (configFileName === '.env' ||
        configFileName.endsWith('.config') ||
        (!configFileName.includes('.') &&
          !existsSync(`${cwd}/${configFileName}.js`) &&
          !existsSync(`${cwd}/${configFileName}.ts`)));
    const envFilePath =
      isEnvFile && existsSync(`${cwd}/${configFileName}`)
        ? `${cwd}/${configFileName}`
        : name
        ? undefined // Если указано имя файла, не ищем стандартные .env
        : ['.env', '../.env', '../../.env'].map((f) => `${cwd}/${f}`).find((f) => existsSync(f));

    // TODO: may be
    // dotenv.config({ path: envFilePath });

    if (envFilePath) {
      log.trace(`Using env file: ${envFilePath}`);
    }

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
              const throwError = initThrowError == null ? !envFilePath : initThrowError;

              // Если файл .env или .config (env файл), загружаем его через dotenv
              // biome-ignore lint/suspicious/noExplicitAny: Type may be various
              const { path, config } = loadConfigSync<any>(configFileName, {
                ...loadConfigOptions,
                // @ts-expect-error
                throwError,
                cwd,
              });
              if (path) {
                log.trace(`Using env.js file: ${path}`);
              }
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
