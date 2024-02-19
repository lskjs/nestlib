export const NESTLIB_RMQ_SERVICE_TOKEN = 'nestlib:RmqService';

export function getRmqServiceToken(ns?: string): string {
  return [ns, NESTLIB_RMQ_SERVICE_TOKEN].filter(Boolean).join(':');
}
