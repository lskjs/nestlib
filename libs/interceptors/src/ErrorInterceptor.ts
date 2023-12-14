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
        const { code, message, status, err, data = null, ...debug } = error || {};

        // NOTE: может не надо делать setTimeout?
        setTimeout(() => {
          printPrettyError(error);
        }, 0);

        context.switchToHttp().getRequest().nestError = error;

        const res = {} as any;
        if (!message) {
          if (typeof err === 'string') {
            res.message = err;
          } else {
            res.message = 'The error';
          }
        }
        if (!status || !(status >= 400 && status <= 600)) {
          res.status = 500;
        }
        if (!code) res.code = `status${res.status || 500}`;
        if (debug && Object.keys(debug).length) {
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
        let packedData = pack(context, data, { code, message, status, ...res });
        // TODO: reimagine the logic of the pack
        if (typeof packedData === 'string') {
          packedData = JSON.parse(packedData);
        }
        return throwError(
          () => new HttpException(packedData, status || res.status, { cause: error }),
        );
      }),
    );
  }
}
