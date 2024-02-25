import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
  Provider,
  Type,
} from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';

import { getLskModuleToken, LSK_MODULE_OPTIONS } from './tokens.js';
import type { LskModuleAsyncOptions, LskModuleOptions, LskOptionsFactory } from './types.js';
import { startLskModule } from './utils.js';

@Global()
@Module({
  imports: [DiscoveryModule],
})
export class LskCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(LSK_MODULE_OPTIONS)
    private readonly options: LskModuleOptions,
    private readonly moduleRef: ModuleRef,
  ) {}
  async onApplicationShutdown(): Promise<void> {
    const token = getLskModuleToken(this.options?.ns);
    const m = this.moduleRef.get<any>(token);
    if (m) await m.stop();
  }

  public static forRoot(options: LskModuleOptions): DynamicModule {
    const token = getLskModuleToken(options.ns);
    const provider: Provider = {
      provide: token,
      useFactory: async () => {
        const m = await startLskModule(options);
        return m;
      },
    };
    return {
      module: LskCoreModule,
      providers: [
        {
          provide: LSK_MODULE_OPTIONS,
          useValue: options,
        },
        provider,
      ],
      exports: [provider],
    };
  }

  public static forRootAsync(options: LskModuleAsyncOptions): DynamicModule {
    const token = getLskModuleToken(options.ns);
    const provider: Provider = {
      provide: token,
      // eslint-disable-next-line no-shadow
      useFactory: async (options: LskModuleOptions) => {
        const m = await startLskModule(options);
        return m;
      },
      inject: [LSK_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: LskCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, provider],
      exports: [provider],
    };
  }
  private static createAsyncProviders(options: LskModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<LskOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }
  private static createAsyncOptionsProvider(options: LskModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: LSK_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<LskOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [(options.useClass || options.useExisting) as Type<LskOptionsFactory>];
    return {
      provide: LSK_MODULE_OPTIONS,
      useFactory: async (optionsFactory: LskOptionsFactory) =>
        // eslint-disable-next-line no-return-await
        await optionsFactory.createLskOptions(),
      inject,
    };
  }
}
