import { DynamicModule, Module, Provider } from '@nestjs/common';

import {
  LockAsyncOptions,
  LockOptions,
  LockOptionsFactory,
} from './interfaces/LockOptions.interface';
import { LOCK, LOCK_OPTIONS } from './Lock.constants';
import { LockService } from './Lock.service';

function createLockProvider(options: LockOptions): any[] {
  return [{ provide: LOCK_OPTIONS, useValue: options || {} }];
}

@Module({
  // imports: [],
  providers: [
    LockService,
    {
      provide: LOCK,
      useExisting: LockService,
    },
  ],
  exports: [LockService, LOCK],
})
export class LockModule {
  static register(options: LockOptions): DynamicModule {
    return {
      module: LockModule,
      providers: createLockProvider(options),
    };
  }

  static registerAsync(options: LockAsyncOptions): DynamicModule {
    return {
      module: LockModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(options: LockAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as any,
        useClass: options.useClass as any,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: LockAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: LOCK_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: LOCK_OPTIONS,
      useFactory: async (optionsFactory: LockOptionsFactory) => optionsFactory.createLockOptions(),
      inject: [(options.useExisting as any) || (options.useClass as any)],
    };
  }
}
