/* eslint-disable no-return-await */
import { Err } from '@lsk4/err';
import { DynamicModule, Module, Provider } from '@nestjs/common';

import { NotifyService } from './Notify.service.js';
import { getNotifyServiceToken, NOTIFY_MODULE_OPTIONS_TOKEN } from './tokens.js';
import type {
  NotifyModuleAsyncOptions,
  NotifyModuleOptions,
  NotifyModuleOptionsFactory,
} from './types.js';

@Module({
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {
  static forRoot(options: NotifyModuleOptions): DynamicModule {
    const NotifyServiceByToken = {
      // TODO: think how to pass namespace?
      provide: getNotifyServiceToken(options.namespace),
      useExisting: NotifyService,
    };
    return {
      module: NotifyModule,
      providers: [
        {
          provide: NOTIFY_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        NotifyService,
        NotifyServiceByToken,
      ],
      exports: [NotifyService, NotifyServiceByToken],
    };
  }

  private static createAsyncProviders(options: NotifyModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: NOTIFY_MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }
    if (options.useClass) {
      return [
        {
          provide: NOTIFY_MODULE_OPTIONS_TOKEN,
          useFactory: async (optionsFactory: NotifyModuleOptionsFactory) =>
            await optionsFactory.createNotifyModuleOptions(),
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    if (options.useExisting) {
      return [
        {
          provide: NOTIFY_MODULE_OPTIONS_TOKEN,
          useFactory: async (optionsFactory: NotifyModuleOptionsFactory) =>
            await optionsFactory.createNotifyModuleOptions(),
          inject: [options.useExisting],
        },
      ];
    }
    throw new Err(
      '!anyOptions',
      'Invalid configuration. Must provide useFactory, useClass, or useExisting.',
    );
  }

  static forRootAsync(options: NotifyModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const NotifyServiceByToken = {
      provide: getNotifyServiceToken(options.namespace),
      useExisting: NotifyService,
    };

    return {
      module: NotifyModule,
      imports: options.imports || [],
      providers: [...asyncProviders, NotifyService, NotifyServiceByToken],
      exports: [NotifyService, NotifyServiceByToken],
    };
  }
}
