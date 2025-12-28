import type { LoadConfigOptions } from '@lsk4/config';
import type {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export type PropsFn = (res: Record<string, unknown>) => Record<string, unknown>;

export interface ConfigModuleOptions<T> extends LoadConfigOptions<T> {
  ns?: string;
  key?: string | PropsFn;

  name?: string;
}

export interface ConfigOptionsFactory<T = unknown> {
  createConfigOptions(): Promise<ConfigModuleOptions<T>> | ConfigModuleOptions<T>;
}

export interface ConfigModuleAsyncOptions<T = unknown> extends Pick<ModuleMetadata, 'imports'> {
  ns?: string;
  useFactory?: (...args: unknown[]) => Promise<ConfigModuleOptions<T>> | ConfigModuleOptions<T>;
  useClass?: Type<ConfigOptionsFactory<T>>;
  useExisting?: Type<ConfigOptionsFactory<T>>;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
