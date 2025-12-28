import apm from '../apm.js';

/**
 * Декоратор для трекинга span'ов внутри транзакций
 * @param name - имя спана
 * @param type - тип спана
 * @param subtype - подтип спана
 */
export function ApmSpan(name?: string, type: string = 'custom', subtype?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const spanName = name || `${className}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      if (!apm.isStarted()) {
        return originalMethod.apply(this, args);
      }

      const span = apm.startSpan(spanName, type, subtype ?? null);

      try {
        const result = await originalMethod.apply(this, args);

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
    };

    return descriptor;
  };
}




