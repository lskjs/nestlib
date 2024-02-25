import { DynamicModule, Module } from '@nestjs/common';

import { LskCoreModule } from './lsk-core.module.js';
import { LskModuleAsyncOptions, LskModuleOptions } from './types.js';

@Module({})
export class LskModule {
  public static forRoot(options: LskModuleOptions): DynamicModule {
    return {
      module: LskModule,
      imports: [LskCoreModule.forRoot(options)],
      exports: [LskCoreModule],
    };
  }

  public static forRootAsync(options: LskModuleAsyncOptions): DynamicModule {
    return {
      module: LskModule,
      imports: [LskCoreModule.forRootAsync(options)],
      exports: [LskCoreModule],
    };
  }
}
