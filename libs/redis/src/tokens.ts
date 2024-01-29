export const NESTLIB_REDIS_CONNECTION = 'default';
export const NESTLIB_REDIS_SERVICE_TOKEN = 'NestlibRedisServiceToken';

export function getRedisServiceToken(connection?: string): string {
  return `${connection || NESTLIB_REDIS_CONNECTION}_${NESTLIB_REDIS_SERVICE_TOKEN}`;
}
