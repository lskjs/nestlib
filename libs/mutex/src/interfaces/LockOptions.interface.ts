import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface RedisOptions {
  host: string;
  port: string;
  password?: string;
}

export interface LockOptions {
  redisOptions?: RedisOptions;
}

export interface LockFunctionOptions {
  timeout: number;
}

export interface LockOptionsFactory {
  createLockOptions(): Promise<LockOptions> | LockOptions;
}

export interface LockAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LockOptionsFactory>;
  useClass?: Type<LockOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<LockOptions> | LockOptions;
  inject?: any[];
}
