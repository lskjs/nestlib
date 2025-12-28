import { Injectable } from '@nestjs/common';
import apm from './apm.js';
import type {
  ApmElasticsearchOptions,
  ApmLlmOptions,
  ApmMongoOptions,
  ApmRabbitMqOptions,
  ApmSpanOptions,
  ApmTransactionOptions,
} from './types.js';
import { createLogger } from '@lsk4/log';

@Injectable()
export class ApmService {
  log = createLogger(this.constructor.name);
  /**
   * Создает и выполняет транзакцию
   */
  async runTransaction<T>(
    name: string,
    type: string,
    fn: () => Promise<T>,
    options?: ApmTransactionOptions,
  ): Promise<T> {
    if (!apm.isStarted()) {
      this.log.warn('[APM] APM is not started, executing function without tracking');
      return fn();
    }

    const transaction = apm.startTransaction(name, type);

    if (transaction && options?.labels) {
      transaction.addLabels(options.labels);
    }

    if (options?.context) {
      apm.setCustomContext(options.context);
    }

    try {
      const result = await fn();

      if (transaction) {
        transaction.result = 'success';
        transaction.end();
      }

      return result;
    } catch (error) {
      if (transaction) {
        apm.captureError(error as Error, {
          custom: {
            transactionName: name,
            transactionType: type,
            ...options?.context,
          },
        });
        transaction.result = 'error';
        transaction.end();
      }
      throw error;
    }
  }

  /**
   * Создает и выполняет span внутри текущей транзакции
   */
  async runSpan<T>(
    name: string,
    type: string,
    fn: () => Promise<T>,
    options?: ApmSpanOptions,
  ): Promise<T> {
    if (!apm.isStarted()) {
      return fn();
    }

    const span = apm.startSpan(name, type, options?.subtype ?? null);

    if (options?.labels && span) {
      span.addLabels(options.labels);
    }

    try {
      const result = await fn();

      if (span) {
        span.end();
      }

      return result;
    } catch (error) {
      if (span) {
        apm.captureError(error as Error);
        span.end();
      }
      throw error;
    }
  }

  /**
   * Специальный метод для трекинга Elasticsearch запросов
   */
  async trackElasticsearchQuery<T>(
    index: string,
    operation: string,
    fn: () => Promise<T>,
    queryBody?: any,
  ): Promise<T> {
    return this.runSpan(
      `elasticsearch.${operation}`,
      'db',
      fn,
      {
        subtype: 'elasticsearch',
        labels: {
          'db.instance': index,
          'db.operation': operation,
        },
        context: {
          elasticsearch: {
            index,
            operation,
            query: queryBody ? JSON.stringify(queryBody).substring(0, 1000) : undefined,
          },
        },
      },
    );
  }

  /**
   * Специальный метод для трекинга MongoDB запросов
   */
  async trackMongoQuery<T>(
    collection: string,
    operation: string,
    fn: () => Promise<T>,
    query?: any,
  ): Promise<T> {
    return this.runSpan(
      `mongodb.${operation}`,
      'db',
      fn,
      {
        subtype: 'mongodb',
        labels: {
          'db.collection.name': collection,
          'db.operation': operation,
        },
        context: {
          mongodb: {
            collection,
            operation,
            query: query ? JSON.stringify(query).substring(0, 1000) : undefined,
          },
        },
      },
    );
  }

  /**
   * Специальный метод для трекинга LLM запросов
   */
  async trackLlmRequest<T>(
    model: string,
    operation: string,
    fn: () => Promise<T>,
    options?: {
      text?: string;
      tokenCount?: number;
    },
  ): Promise<T> {
    return this.runSpan(
      `llm.${operation}`,
      'external',
      fn,
      {
        subtype: 'http',
        labels: {
          'llm.model': model,
          'llm.operation': operation,
          'llm.token_count': options?.tokenCount || 0,
        },
        context: {
          llm: {
            model,
            operation,
            text: options?.text ? options.text.substring(0, 500) : undefined,
            tokenCount: options?.tokenCount,
          },
        },
      },
    );
  }

  /**
   * Трекинг RabbitMQ обработки сообщений
   */
  async trackRabbitMqMessage<T>(
    queue: string,
    routingKey: string,
    fn: (transaction?: any) => Promise<T>,
    messageData?: any,
  ): Promise<T> {
    if (!apm.isStarted()) {
      this.log.warn('[APM] APM is not started, executing function without tracking');
      return fn(null);
    }

    const transaction = apm.startTransaction(`rabbitmq.${queue}`, 'messaging');

    if (transaction) {
      transaction.addLabels({
        'messaging.system': 'rabbitmq',
        'messaging.destination': queue,
        'messaging.routing_key': routingKey,
      });

      apm.setCustomContext({
        rabbitmq: {
          queue,
          routingKey,
          messageSize: messageData ? JSON.stringify(messageData).length : 0,
        },
      });
    }

    try {
      const result = await fn(transaction);

      if (transaction) {
        transaction.result = 'success';
        transaction.end();
      }

      return result;
    } catch (error) {
      if (transaction) {
        apm.captureError(error as Error, {
          custom: {
            transactionName: `rabbitmq.${queue}`,
            transactionType: 'messaging',
            queue,
            routingKey,
          },
        });
        transaction.result = 'error';
        transaction.end();
      }
      throw error;
    }
  }

  /**
   * Добавление кастомных лейблов к текущей транзакции
   */
  addLabels(labels: Record<string, string | number | boolean>): void {
    apm.addLabels(labels);
  }

  /**
   * Добавление кастомных лейблов к конкретной транзакции
   */
  addLabelsToTransaction(
    transaction: any,
    labels: Record<string, string | number | boolean>,
  ): void {
    if (transaction && transaction.addLabels) {
      transaction.addLabels(labels);
    } else {
      // Fallback к глобальному методу если транзакция недоступна
      apm.addLabels(labels);
    }
  }

  /**
   * Добавление кастомного контекста к текущей транзакции
   */
  setCustomContext(context: Record<string, any>): void {
    apm.setCustomContext(context);
  }

  /**
   * Ручная отправка ошибки
   */
  captureError(error: Error, context?: Record<string, any>): void {
    apm.captureError(error, {
      custom: context,
    });
  }

  /**
   * Проверка, запущен ли APM
   */
  isStarted(): boolean {
    return apm.isStarted();
  }
}




