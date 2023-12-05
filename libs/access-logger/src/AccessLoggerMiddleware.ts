import { isDev } from '@lsk4/env';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { expressAccessLoggerMiddeware } from './expressAccessLoggerMiddeware.js';
import type { AccessLoggerData, Request, Response, NextFunction } from './types.js';

let reqId = 0;

@Injectable()
export class AccessLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (isDev) {
      reqId += 1;
      req.reqId = reqId;
    } else {
      req.reqId = nanoid();
    }
    expressAccessLoggerMiddeware(req, res, next);
  }
}

export default AccessLoggerMiddleware;
