import type { ILogger } from '@lsk4/log';
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNextFunction } from 'express';

export type Request = ExpressRequest & {
  reqId?: string | number;
  log?: ILogger;
  ws?: any;
  _direct?: boolean;
  data?: any;
  getHeader: (name: string) => string;
};

export type Response = ExpressResponse & {
  statusCode?: number;
};
export type NextFunction = ExpressNextFunction & {
  statusCode?: number;
};

export type AccessLoggerData = {
  method: string;
  err?: any;
  status?: number;
  duration?: number;
  reqId?: string | number;
  host?: string;
  url?: string;
  referer?: string;
  ua?: string;
  ip?: string;
  length?: number;
};
