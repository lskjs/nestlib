// TODO: @ga2mer: прокинуть везде типы
// @ts-nocheck

import { createLogger } from '@lsk4/log';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Req } from '@nestjs/common';
import { isNil } from '@nestjs/common/utils/shared.utils.js';
import { LOCK, LockService } from '@nestlib/mutex';
import objectHash from 'object-hash';

interface Params {
  ttl: number;
  lockTimeout?: number;
  session?: boolean;
  paramIndex?: number[];
}

const reqInject = Req();

function transform(obj: any) {
  const transformedObj = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        transformedObj[key] = obj[key];
      } else {
        // call function recursively for object
        transformedObj[key] = transform(obj[key]);
      }
    } else {
      const isCacheIgnored = Reflect.getMetadata('IgnoreCache', obj, key);
      if (!isCacheIgnored && typeof obj[key] !== 'undefined') {
        transformedObj[key] = obj[key];
      }
    }
  }
  return transformedObj;
}

const log = createLogger('cache');

export function Cache(params: Params) {
  const injector = Inject(CACHE_MANAGER);
  const lockInjector = Inject(LOCK);
  return (
    target: Record<string, any>,
    _key?: string,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    injector(target, 'cacheManager');
    lockInjector(target, 'lock');
    const originalMethod = descriptor.value;
    const reqIndex = originalMethod.length;
    reqInject(target, _key, reqIndex);

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      const lockService: LockService = this.lock;
      const className = target.constructor.name;
      const targetMethod = `${className}.${_key}`;
      const req = args[reqIndex];
      const userId = req?.session?.user?._id;
      const hashArray = [];
      const { paramIndex = [] } = params;
      args.forEach((arg, index) => {
        if (paramIndex.includes[index]) {
          if (typeof arg === 'object') {
            const filteredDTO = transform(arg);
            hashArray.push(filteredDTO);
          } else {
            hashArray.push(arg);
          }
        }
      });
      try {
        const hash = objectHash(hashArray);
        // возможно лучше использовать юрл вместо названия класса и метода
        let key = `${targetMethod}_${hash}`;
        if (params.session && userId) {
          key = `${userId}_${key}`;
        }
        let value = await this.cacheManager.get(key);
        if (!isNil(value)) {
          return value;
        }
        const lockTimeout = params.lockTimeout || params.ttl;
        const res = await lockService.acquire(
          key,
          async () => {
            value = await this.cacheManager.get(key);
            if (!isNil(value)) {
              return value;
            }
            const result = await originalMethod.apply(this, args);
            const cacheArgs = [key, result];
            if (typeof params.ttl === 'number') {
              // TODO: переделать на манер как это сделано в cache manager
              if (this.cacheManager?.store?.name === 'redis') {
                cacheArgs.push({
                  ttl: params.ttl / 1000, // пока надеемся что там целое число
                });
              } else {
                cacheArgs.push(params.ttl);
              }
            }
            this.cacheManager.set(...cacheArgs);
            return result;
          },
          {
            timeout: lockTimeout,
          },
        );
        return res;
      } catch (err) {
        log.error(err);
        return originalMethod(args);
      }
    };
  };
}
