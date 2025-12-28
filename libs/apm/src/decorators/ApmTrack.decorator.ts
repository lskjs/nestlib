import apm from '../apm.js';

/**
 * Декоратор для автоматического трекинга методов с APM
 * @param name - имя транзакции/спана (опционально, по умолчанию используется имя метода)
 * @param type - тип транзакции (по умолчанию 'custom')
 */
export function ApmTrack(name?: string, type: string = 'custom') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const trackingName = name || `${className}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      if (!apm.isStarted()) {
        return originalMethod.apply(this, args);
      }

      const transaction = apm.startTransaction(trackingName, type);

      try {
        const result = await originalMethod.apply(this, args);

        if (transaction) {
          transaction.result = 'success';
          transaction.end();
        }

        return result;
      } catch (error) {
        if (transaction) {
          apm.captureError(error as Error, {
            custom: {
              className,
              method: propertyKey,
              args: JSON.stringify(args, null, 2).substring(0, 1000), // Ограничиваем размер
            },
          });
          transaction.result = 'error';
          transaction.end();
        }
        throw error;
      }
    };

    return descriptor;
  };
}




