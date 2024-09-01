import { omitBy } from '@lsk4/algos';
import { isDev } from '@lsk4/env';
import { Err } from '@lsk4/err';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { pack } from './utils/pack';
import { printPrettyError } from './utils/printPrettyError';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error = {}) => {
        // TODO: get from config
        // TODO: подумать о уровнях логирования ошибок
        // 1. локальная разработка, писать в debug всю внутрянку, чтобы на фронте и в консоли видеть причину
        // 2. дев сервер -- пусть (опционально включать) тоже самое внутрянку, когда нужно. (подумать по статусы, например внутрянку 400х ошибок и на локалке порой не нужно)
        // 3. бета сервер -- писать в логи debug, но не отправлять пользователю. отправлять пользователю только code, message
        // 4. продакшн -- отправлять пользователю только определенные code, message, всё что не в whitelist - заменять на общее сообщение
        // TODO: так же подумать о разных статусах, например для прод сервера не нужны подробности 400х ошибок в консоли, но нужно подробности 500х
        const isDebug = isDev;

        // eslint-disable-next-line prefer-const
        let [code, message] = Err.getCodeMessage(error);
        const { status, err, data, ...rawDebug } = error || {};
        const debug = omitBy(
          rawDebug,
          (v, k) =>
            ['code', 'message', '__err'].includes(k as any) ||
            v == null ||
            (k === 'name' && v === 'Err'),
        );
        const { name } = debug;

        // NOTE: может не надо делать setTimeout?
        setTimeout(() => {
          printPrettyError(error);
        }, 0);

        context.switchToHttp().getRequest().nestError = error;

        const res = {} as any;
        if (!message) {
          if (typeof err === 'string') {
            res.message = err;
          }
          // else {
          //   res.message = 'The Unknown Error';
          // }
        }
        if (!status || !(status >= 400 && status <= 600)) {
          res.status = 500;
        }
        if (!code) res.code = name || `err${res.status || 500}`;
        if (code === 'Error') code = 'errUnknown';
        if (isDebug && debug && Object.keys(debug).length) {
          res.debug = debug;
        }
        if (err) {
          res.err = err;
        }
        // if (isDev && pack.stack) {
        //   res.stack = pack.stack;
        // }
        if (true && err && err.stack) {
          res.stack = err.stack;
        }
        if (res.stack) {
          const stack = res.stack.toString();
          res.stack = stack.split('\n').map((s: string) => s.trim());
        }
        const packedData = pack(
          context,
          data,
          { ok: 0, code, message, status, ...res },
          { toString: false },
        );
        const status2 = status || res.status;
        const options = { cause: error, description: message };
        return throwError(() => new HttpException(packedData, status2, options));
      }),
    );
  }
}
