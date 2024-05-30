import { Err } from '@lsk4/err';
import { validate } from 'class-validator';

export const validateErrorsAndThrow = async (errors: any[]) => {
  if (!errors.length) return;
  const messages = errors.map((error) => {
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
  throw new Err('Validation Error', {
    status: 400,
    data: messages,
  });
};

export const validateAndThrow = async (params: any) => {
  const validationErrors: any[] = await validate(params);
  await validateErrorsAndThrow(validationErrors);
};
