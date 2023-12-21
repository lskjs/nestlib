import { Transform, TransformOptions } from 'class-transformer';

export interface TrimOptions {
  /** @default 'both' */
  strategy?: 'start' | 'end' | 'both';
}

export function Trim(
  options?: TrimOptions,
  transformOptions?: TransformOptions,
): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value !== 'string') {
      return value;
    }

    switch (options?.strategy) {
      case 'start':
        return value.trimLeft();
      case 'end':
        return value.trimRight();
      default:
        return value.trim();
    }
  }, transformOptions);
}
