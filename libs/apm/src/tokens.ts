export const NESTLIB_APM_SERVICE_TOKEN = 'nestlib:ApmService';

export function getApmServiceToken(ns?: string): string {
  return [ns, NESTLIB_APM_SERVICE_TOKEN].filter(Boolean).join(':');
}




