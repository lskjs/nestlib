import { RedisModule } from '@liaoliaots/nestjs-redis';
import { createLogger } from '@lsk4/log';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { RedisService } from './RedisService.js';
import { getRedisServiceToken } from './tokens.js';

const log = createLogger('redis');

@Global()
@Module({})
export class RdsModule {
  static forRoot(options: any = {}): DynamicModule {
    log.trace('[forRoot]', options);
    const RedisService2 = {
      provide: getRedisServiceToken(options.connection),
      useExisting: RedisService,
    };
    return {
      imports: [RedisModule.forRoot(options)],
      module: RdsModule,
      providers: [RedisService, RedisService2],
      exports: [RedisService, RedisService2],
    };
  }
  static forRootAsync(options: any = {}): DynamicModule {
    log.trace('[forRootAsync]', options);
    const RedisService2 = {
      provide: getRedisServiceToken(options.connection),
      useExisting: RedisService,
    };
    return {
      imports: [RedisModule.forRootAsync(options)],
      module: RdsModule,
      providers: [RedisService, RedisService2],
      exports: [RedisService, RedisService2],
    };
  }
}
