import { omit } from '@lsk4/algos';
import { isDev } from '@lsk4/env';
import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';

import { getLogLevel } from './getLogLevel.js';
import { getReqIp } from './getReqIp.js';
import type { AccessLoggerData, NextFunction, Request, Response } from './types.js';

const defaultLogger = createLogger({ name: 'req' }); // TODO: подумать нужно ли создавать или надо наследоваться
export function expressAccessLoggerMiddeware(req: Request, res: Response, next?: NextFunction) {
  const log = req.log || defaultLogger;

  const data: AccessLoggerData = {
    method: req.method,
    reqId: req.reqId,
  };
  if (req.ws) data.method = 'WS';
  if (req._direct) data.method = `#${data.method}`;
  data.host = req.headers.host;
  if (req.ws) {
    data.url = `${req.ws.nsp.name} ${JSON.stringify(
      omit(req.data, ['EIO', 'transport', 'token']),
    )}`;
  } else {
    data.url = (req.baseUrl || '') + (req.url || '-');
  }
  data.referer = req.header('referer') || req.header('referrer');
  data.ua = req.header('user-agent');
  data.ip = getReqIp(req);

  // let startLogger: NodeJS.Timeout;
  let startLogger: any;
  if (isDev) {
    // TODO: заменить на debug level
    startLogger = setTimeout(() => {
      const args = [data];
      if (req.body && Object.keys(req.body).length) {
        args.push(req.body);
      }
      log[getLogLevel(data, 'start')](...args);
    }, 1500);
  }

  const hrtime = process.hrtime();
  function logging() {
    clearTimeout(startLogger);
    data.status = res.statusCode;
    data.length = Number(res.getHeader('Content-Length')) || 0;

    // @ts-ignore
    const err = (this.req.nestError || this.req.err || this.req.error) as any;
    if (err) {
      const errCode = err ? Err.getCode(err) : null;
      data.err = errCode;
    }

    const diff = process.hrtime(hrtime);
    data.duration = diff[0] * 1e3 + diff[1] * 1e-6;

    log[getLogLevel(data, 'finish')](data);
  }
  res.on('close', logging);
  if (next) next();
}
