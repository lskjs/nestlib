export const NESTLIB_REDIS_SERVICE_TOKEN = 'nestlib:RedisService';

export function getRedisServiceToken(ns?: string): string {
  return [ns, NESTLIB_REDIS_SERVICE_TOKEN].filter(Boolean).join(':');
}
