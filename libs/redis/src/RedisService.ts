import {
  //  InjectRedis,
  RedisService as BaseRedisService,
} from '@liaoliaots/nestjs-redis';
import { createLogger } from '@lsk4/log';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  log = createLogger('redis');
  constructor(
    // @InjectRedis() public readonly redis: Redis,
    private readonly redisService: BaseRedisService,
  ) {}

  // async set(key: string, value: any, ...args: any[]) {
  //   this.log.trace('[set]', key, value, args);
  //   const res = await this.redis.set(key, value, ...args);
  //   // this.log.debug('[set]', key, value, args, res);
  //   return res;
  // }
  // async get(key: string, ...args: any[]) {
  //   this.log.trace('[get]', key, args);
  //   const res = await this.redis.get(key, ...args);
  //   // this.log.debug('[get]', key, args, res);
  //   return res;
  // }
  getClient(namespace?: string): Redis {
    // return null as Redis
    return this.redisService.getClient(namespace);
  }
}
