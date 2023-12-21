import { createParamDecorator, ExecutionContext } from '@nestjs/common';
/**
 * Query handler with multiple properties suppport
 * Iterates the params in the order specified in the array until value is not undefined
 *
 * For example:
 * ```typescript
 * async findOne(@Query(['_id', 'id']) id: string)
 * ```
 * ```typescript
 * async findOne(@Query('_id') id: string)
 * ```
 *
 * @param property name of single property or array of properties to extract from the `query` object
 */
export const Query = createParamDecorator((property: string | string[], ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const properties = Array.isArray(property) ? property : [property];
  let value;
  // eslint-disable-next-line no-restricted-syntax
  for (const param of properties) {
    value = request.query[param];
    if (typeof value !== 'undefined') {
      break;
    }
  }
  return value;
});
