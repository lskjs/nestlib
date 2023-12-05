import type { Request } from './types.js';

export function getReqIp(req: Request) {
  let ip =
    req?.headers?.['x-forwarded-for'] ||
    req?.connection?.remoteAddress ||
    req?.socket?.remoteAddress ||
    // NOTE: странно что типа нет, должно работать
    // @ts-ignore 
    req?.socket?.socket?.remoteAddress ||
    req?.ip ||
    null;

  if (Array.isArray(ip)) ip = ip.join(',');

  // if (isLocalhost(ip)) {
  //   ip = 'localhost';
  // }
  return ip;
}
