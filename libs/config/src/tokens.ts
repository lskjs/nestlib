export const NESTLIB_CONFIG_SERVICE_TOKEN = 'nestlib:ConfigService';

export function getConfigServiceToken(ns?: string): string {
  return [ns, NESTLIB_CONFIG_SERVICE_TOKEN].filter(Boolean).join(':');
}
