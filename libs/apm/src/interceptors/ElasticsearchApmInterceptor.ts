import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import apm from '../apm.js';

@Injectable()
export class ElasticsearchApmInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!apm.isStarted()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Получаем информацию о методе и классе
    const className = context.getClass().name;
    const methodName = context.getHandler().name;

    // Создаем span для Elasticsearch операции
    const span = apm.startSpan(`${className}.${methodName}`, 'db', 'elasticsearch');

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        if (span) {
          span.addLabels({
            'db.type': 'elasticsearch',
            'db.operation': methodName,
            'http.status_code': response?.statusCode || 200,
            'elasticsearch.duration_ms': duration,
          });
          span.end();
        }

        // Добавляем метрики в APM
        apm.addLabels({
          'elasticsearch.query_time': duration,
          'elasticsearch.method': methodName,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        if (span) {
          span.addLabels({
            'db.type': 'elasticsearch',
            'db.operation': methodName,
            'error': true,
            'elasticsearch.duration_ms': duration,
          });
          span.end();
        }

        // Отправляем ошибку в APM
        apm.captureError(error, {
          custom: {
            elasticsearch: {
              operation: methodName,
              className,
              duration,
            },
          },
        });

        return throwError(() => error);
      }),
    );
  }
}




