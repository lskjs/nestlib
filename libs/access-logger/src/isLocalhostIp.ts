export function isLocalhostIp(ip: string) {
  return (
    typeof ip === 'string' &&
    (ip.includes('127.0.0.1') || ['127.0.0.1', '::ffff:127.0.0.1', '::1'].includes(ip))
  );
}
