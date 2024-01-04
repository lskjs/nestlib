import { Err } from '@lsk4/err';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Exclude, plainToInstance } from 'class-transformer';
import { IsBoolean, IsNumber, Max, Min, validate } from 'class-validator';

export class Find<Filter = any> {
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsNumber()
  offset: number = 0;

  @Exclude()
  filter?: Filter;

  sort: any;

  // Нужно ли возвращать общее количество записей
  @IsBoolean()
  count?: any = false;
}

interface FindParamsArgs {
  filterDTO: any;
}

export const FindParams = createParamDecorator(
  async (args: FindParamsArgs, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const data = { ...request.query, ...request.body };
    const { filter = {} } = data;
    const findParams = plainToInstance(Find, data, { enableImplicitConversion: true });
    let filterValidationErrors: any[] = [];
    if (args?.filterDTO) {
      findParams.filter = plainToInstance(args.filterDTO, filter, {
        enableImplicitConversion: true,
      });
      filterValidationErrors = await validate(findParams.filter);
    }
    const validationErrors: any[] = [...(await validate(findParams)), ...filterValidationErrors];
    if (validationErrors.length) {
      const messages = validationErrors.map((error) => {
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
    }
    return findParams;
  },
);
