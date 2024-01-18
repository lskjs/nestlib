export const NESTLIB_RMQ_CONNECTION = 'default';
export const NESTLIB_RMQ_SERVICE_TOKEN = 'NestlibRmqServiceToken';

export function getRmqServiceToken(connection?: string): string {
  return `${connection || NESTLIB_RMQ_CONNECTION}_${NESTLIB_RMQ_SERVICE_TOKEN}`;
}
