import type { RlogOptions } from '@lsk4/rlog';
import { Type } from '@nestjs/common';

export type NotifyModuleOptions = RlogOptions & {
  namespace: string;
  // some custom options
};

export interface NotifyModuleOptionsFactory {
  createNotifyModuleOptions(): Promise<NotifyModuleOptions> | NotifyModuleOptions;
}

export interface NotifyModuleAsyncOptions {
  namespace: string;

  useExisting?: Type<NotifyModuleOptionsFactory>;
  useClass?: Type<NotifyModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<NotifyModuleOptions> | NotifyModuleOptions;
  inject?: any[];
  imports?: any[];
}
