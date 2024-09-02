import { omitBy } from '@lsk4/algos';
import { isDev, stage } from '@lsk4/env';
import { Err } from '@lsk4/err';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
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
        // eslint-disable-next-line prefer-const
        let [code, message] = Err.getCodeMessage(error);
        const {
          status: rawStatus,
          // statusCode: rawStatusCode,
          err,
          data,
          ...rawDebug
        } = error || {};
        const status =
          +rawStatus ||
          // TODO: подумать можно ли так кидаться?
          // rawStatusCode ||
          500;

        // TODO: подумать о уровнях логирования ошибок
        // 3. локальная разработка, писать в debug всю внутрянку, чтобы на фронте и в консоли видеть причину
        // 2. дев сервер -- пусть (опционально включать) тоже самое внутрянку, когда нужно. (подумать по статусы, например внутрянку 400х ошибок и на локалке порой не нужно)
        // 1. бета сервер -- писать в логи debug, но не отправлять пользователю. отправлять пользователю только code, message
        // 0. продакшн -- отправлять пользователю только определенные code, message, всё что не в whitelist - заменять на общее сообщение
        // TODO: так же подумать о разных статусах, например для прод сервера не нужны подробности 400х ошибок в консоли, но нужно подробности 500х

        // TODO: get from config
        // eslint-disable-next-line no-nested-ternary
        const debugLevel = isDev ? 3 : stage === 'dev' ? 2 : stage === 'beta' ? 1 : 0;
        // const debugLevel = 2;
        const isShowDebug = debugLevel >= 3;
        const isInternalError = status >= 500;
        const isShowConsole = isShowDebug || isInternalError;
        const isShowInternalError = debugLevel >= 2;
        const isShowError = isShowDebug || (isInternalError ? isShowInternalError : true);
        // console.log({
        //   debugLevel,
        //   isShowDebug,
        //   isInternalError,
        //   isShowConsole,
        //   isShowError,
        //   rawStatus,
        // });
        // const isInteral = debugLevel >= 2;
        // const isDebug = isDev;

        const debug = omitBy(
          rawDebug,
          (v, k) =>
            ['code', 'message', '__err'].includes(k as any) ||
            v == null ||
            (k === 'name' && v === 'Err'),
        );

        if (isShowConsole) {
          // NOTE: может не надо делать setTimeout?
          setTimeout(() => {
            printPrettyError(error);
          }, 0);
        }

        context.switchToHttp().getRequest().nestError = error;

        if (!isShowError) {
          return throwError(
            () =>
              new InternalServerErrorException(
                {
                  ok: 0,
                  code: 'errInternal',
                  message: 'Internal Server Error',
                },
                {
                  cause: error,
                  description: message,
                },
              ),
          );
        }

        const res = {} as any;
        if (!message) {
          if (typeof err === 'string') {
            res.message = err;
          }
          // else {
          //   res.message = 'The Unknown Error';
          // }
        }
        if (!code) res.code = `err${status}`;
        if (code === 'Error') code = 'errUnknown';
        if (isInternalError) code = `errInternal(${code})`;
        if (isShowDebug && debug && Object.keys(debug).length) {
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
        const options = { cause: error, description: message };
        return throwError(() => new HttpException(packedData, status, options));
      }),
    );
  }
}
