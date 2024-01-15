export const NESTLIB_CONFIG_CONNECTION = 'default';
export const NESTLIB_CONFIG_SERVICE_TOKEN = 'NestlibConfigServiceToken';

export function getConfigServiceToken(connection?: string): string {
  return `${connection || NESTLIB_CONFIG_CONNECTION}_${NESTLIB_CONFIG_SERVICE_TOKEN}`;
}
