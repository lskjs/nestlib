import { Inject, Injectable } from '@nestjs/common';
import AsyncLock from 'async-lock';
import { createClient } from 'redis';
// @ts-ignore there is no types
import redisLock from 'redis-lock';

import type {
  LockFunctionOptions,
  LockOptions,
  RedisOptions,
} from './interfaces/LockOptions.interface';
import { LOCK_OPTIONS } from './Lock.constants';

@Injectable()
export class LockService {
  redisEnabled = false;
  redisLock: any;
  constructor(@Inject(LOCK_OPTIONS) protected readonly config: LockOptions) {
    if (typeof config.redisOptions === 'object' && Object.keys(config.redisOptions).length) {
      this.redisEnabled = true;
      this.createClient();
    }
  }

  async acquire(key: string, cb: any, options: LockFunctionOptions) {
    const timeout = options?.timeout || 60000;
    if (this.redisEnabled) {
      const done = await this.redisLock(key, timeout);
      const res = await cb();
      await done();
      return res;
    }
    const lock = new AsyncLock({
      timeout,
    });
    return lock.acquire(key, cb);
  }

  private async createClient() {
    const options = {
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
    } as any;
    const { host, port, password } = this.getOptions() || {};
    if (typeof host === 'string') {
      options.socket.host = host;
    }
    if (typeof port === 'number') {
      options.socket.port = port;
    }
    if (typeof password === 'string') {
      options.socket.password = password;
    }
    const client = await createClient(options)
      // eslint-disable-next-line no-console
      .on('error', (err) => console.log('Lock Redis Client Error', err))
      .connect();
    this.redisLock = redisLock(client);
  }

  private getOptions(): RedisOptions | undefined {
    return this.config.redisOptions;
  }
}
