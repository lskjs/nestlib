/** biome-ignore-all lint/complexity/noStaticOnlyClass: Static is ok in nest */
import { existsSync, readFileSync } from 'node:fs';

import { loadConfig, loadConfigSync } from '@lsk4/config';
import { Err } from '@lsk4/err';
import {
  type DynamicModule,
  Global,
  type InjectionToken,
  Module,
  type Provider,
} from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import dotenv from 'dotenv';
import { ConfigService } from './Config.service.js';
import { log } from './log.js';
import { getConfigServiceToken } from './tokens.js';
import type { ConfigModuleAsyncOptions, ConfigModuleOptions } from './types.js';

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

  // biome-ignore lint/suspicious/noExplicitAny: Type may be various
  static forRootAsync(asyncOptions: ConfigModuleAsyncOptions<any> = {}): DynamicModule {
    const { ns, imports = [], inject = [], useFactory, useClass, useExisting } = asyncOptions;

    const _ConfigService = {
      provide: getConfigServiceToken(ns),
      useExisting: ConfigService,
    };

    const asyncConfigProvider: Provider = {
      provide: 'CONFIG_MODULE_OPTIONS',
      useFactory: async (...args: unknown[]) => {
        let options: ConfigModuleOptions<unknown>;

        if (useFactory) {
          options = await useFactory(...args);
        } else if (useClass || useExisting) {
          const optionsFactory = args[0] as {
            createConfigOptions: () =>
              | Promise<ConfigModuleOptions<unknown>>
              | ConfigModuleOptions<unknown>;
          };
          options = await optionsFactory.createConfigOptions();
        } else {
          options = {};
        }

        return options;
      },
      inject:
        useClass || useExisting ? [useClass || (useExisting as InjectionToken), ...inject] : inject,
    };

    const configLoaderProvider: Provider = {
      provide: 'CONFIG_LOADED',
      useFactory: async (options: ConfigModuleOptions<unknown>) => {
        const {
          name,
          key,
          throwError: initThrowError,
          cwd: optionsCwd,
          ...loadConfigOptions
        } = options;

        const cwd = optionsCwd || process.cwd();
        const configFileName = name || '.env';
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
            ? undefined
            : ['.env', '../.env', '../../.env']
                .map((f) => `${cwd}/${f}`)
                .find((f) => existsSync(f));

        if (envFilePath) {
          log.trace(`Using env file: ${envFilePath}`);
        }

        const throwError = initThrowError == null ? !envFilePath : initThrowError;

        // biome-ignore lint/suspicious/noExplicitAny: Type may be various
        let config: any;

        // If it's an env file, parse it with dotenv
        if (envFilePath) {
          const envContent = readFileSync(envFilePath, 'utf-8');
          config = dotenv.parse(envContent);
        } else {
          // Otherwise use loadConfig for JS/TS/JSON files
          // biome-ignore lint/suspicious/noExplicitAny: Type may be various
          const result = await loadConfig<any>(configFileName, {
            ...loadConfigOptions,
            // @ts-expect-error
            throwError,
            cwd,
          });

          if (result.path) {
            log.trace(`Using config file: ${result.path}`);
          }
          config = result.config;
        }

        let resultConfig: unknown;
        if (!key) {
          resultConfig = config;
        } else if (typeof key === 'string') {
          resultConfig = config?.[key];
        } else if (typeof key === 'function') {
          resultConfig = key(config);
        } else {
          throw new Err('Invalid keyOrFn');
        }

        return resultConfig;
      },
      inject: ['CONFIG_MODULE_OPTIONS'],
    };

    const nestConfigServiceProvider: Provider = {
      provide: NestConfigService,
      useFactory: (configLoaded: Record<string, unknown>) => {
        return new NestConfigService(configLoaded);
      },
      inject: ['CONFIG_LOADED'],
    };

    const configServiceProvider: Provider = {
      provide: ConfigService,
      useFactory: (nestConfigService: NestConfigService) => {
        return new ConfigService(nestConfigService);
      },
      inject: [NestConfigService],
    };

    return {
      imports: [...imports],
      module: ConfigModule,
      providers: [
        asyncConfigProvider,
        configLoaderProvider,
        nestConfigServiceProvider,
        configServiceProvider,
        _ConfigService,
      ],
      exports: [ConfigService, _ConfigService, NestConfigService],
    };
  }
}
