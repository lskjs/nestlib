import { DynamicModule, Global, Module } from '@nestjs/common';

import { initApm } from './apm.js';
import { ApmService } from './ApmService.js';
import { getApmServiceToken } from './tokens.js';
import type { ApmModuleOptions } from './types.js';

@Global()
@Module({})
export class ApmModule {
  static forRoot(options: ApmModuleOptions = {}): DynamicModule {
    // Initialize APM before module creation
    initApm({
      config: options.config,
      active: options.active,
    });

    const ApmServiceProvider = {
      provide: getApmServiceToken(),
      useClass: ApmService,
    };

    return {
      module: ApmModule,
      providers: [ApmService, ApmServiceProvider],
      exports: [ApmService, ApmServiceProvider],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory?: (...args: any[]) => Promise<ApmModuleOptions> | ApmModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const ApmServiceProvider = {
      provide: getApmServiceToken(),
      useClass: ApmService,
    };

    return {
      module: ApmModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'APM_MODULE_OPTIONS',
          useFactory: options.useFactory || (() => ({})),
          inject: options.inject || [],
        },
        {
          provide: 'APM_INIT',
          useFactory: (apmOptions: ApmModuleOptions) => {
            initApm({
              config: apmOptions.config,
              active: apmOptions.active,
            });
            return apmOptions;
          },
          inject: ['APM_MODULE_OPTIONS'],
        },
        ApmService,
        ApmServiceProvider,
      ],
      exports: [ApmService, ApmServiceProvider],
    };
  }
}

