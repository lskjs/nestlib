import { Inject } from '@nestjs/common';

export const NOTIFY_MODULE_OPTIONS_TOKEN = 'NotifyModuleOptions';
export const NOTIFY_SERVICE_TOKEN = 'NotifyService';

export function getNotifyServiceToken(ns?: string): string {
  return [ns, NOTIFY_SERVICE_TOKEN].filter(Boolean).join('_');
}

export const InjectNotifyService = (connection?: string) =>
  Inject(getNotifyServiceToken(connection));
