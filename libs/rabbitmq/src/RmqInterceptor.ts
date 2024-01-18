import { isDev } from '@lsk4/env';
import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';
import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { delay } from 'fishbird';
import { lastValueFrom, Observable, of } from 'rxjs';

import { getRmqConfig, rmqDeliveryAttempts } from './config';
import { inc } from './utils';

// import { deliveryAttempts, errDelay, inc, isLog, maxAttempts } from './utils';

@Injectable()
export class RmqInterceptor implements NestInterceptor {
  private log = createLogger(this.constructor.name, { ns: 'rmq', level: 'warn' });
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const type = context.getType() as ContextType | 'rmq';
    const isLog = getRmqConfig('isLog') || false;
    const maxAttempts = getRmqConfig('maxAttempts') || 0;
    const errDelay = getRmqConfig('errDelay') || 0;

    if (type !== 'rmq') return next.handle();
    const startedAt = new Date();
    const name = context.getHandler().name || context.getClass().name;
    const message = context.getArgByIndex(0);
    const data = message?.data;
    const { fields, properties } = context.getArgByIndex(1);
    const { correlationId } = properties;
    const { redelivered } = fields;
    const messageId = correlationId;
    if (isLog) this.log.debug(`[${name}]`, 'init', data);
    try {
      if (!data) throw new Err('!data', { status: 400 });
      const res = await lastValueFrom(next.handle());
      const finishedAt = new Date();
      const duration = +finishedAt - +startedAt;
      if (isLog) this.log.info(`[${name}]`, 'success', { duration });
      const meta = { data, meta: message.meta, startedAt, finishedAt, duration };
      delete rmqDeliveryAttempts[messageId];
      return of({
        code: 0,
        data: res,
        message: 'ok',
        meta,
      });
    } catch (err) {
      const finishedAt = new Date();
      const duration = +finishedAt - +startedAt;
      const attempts = inc(rmqDeliveryAttempts, messageId);
      const isMaxAttempts = Boolean(redelivered && attempts > maxAttempts);
      const meta = { data, meta: message.meta, startedAt, finishedAt, duration, attempts };
      const status: any = (err as any)?.status;
      if (status === 200) {
        this.log.warn(`[${name}] skip`, Err.getCode(err), { duration });
      } else {
        if (isMaxAttempts) {
          this.log.warn(`[${name}] manyAttempts`, Err.getCode(err), { duration });
        } else {
          this.log.error(`[${name}] err`, Err.getCode(err), { duration });
        }
        if (isDev) {
          this.log.error(`[${name}] err`, err);
          // this.log.error(err?.stack);
          this.log.trace(`[${name}] delay`, errDelay);
          await delay(errDelay);
        }
      }
      if (isMaxAttempts) delete rmqDeliveryAttempts[messageId];
      throw new Err(err, {
        status: isMaxAttempts ? 300 : status || 500,
        meta,
      });
    }
  }
}
