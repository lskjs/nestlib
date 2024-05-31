import { Err } from '@lsk4/err';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export class AnyValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map((error: any) => {
          let message;
          const keys = Object.keys(error.constraints);
          if (keys.length > 1) {
            message = Object.values(error.constraints);
          } else {
            message = error.constraints[keys[0]];
          }
          return {
            property: error.property,
            message,
          };
        });
        return new Err('Validation Error', {
          status: 400,
          data: messages,
        });
      },
      ...options,
    });
  }
}
