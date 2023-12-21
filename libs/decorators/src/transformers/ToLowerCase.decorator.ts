import { Transform, TransformOptions } from 'class-transformer';

export function ToLowerCase(
  transformOptions?: TransformOptions,
): (target: any, key: string) => void {
  return Transform(({ value }: any) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.toLowerCase();
  }, transformOptions);
}
