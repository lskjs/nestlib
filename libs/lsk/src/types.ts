import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface LskModuleOptions {
  ns?: string;

  module: any;
  config?: any;
  modules?: any;
}

export interface LskOptionsFactory {
  createLskOptions(): Promise<LskModuleOptions> | LskModuleOptions;
}

export interface LskModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  ns?: string;

  useExisting?: Type<LskOptionsFactory>;
  useClass?: Type<LskOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<LskModuleOptions> | LskModuleOptions;
  inject?: any[];
}
