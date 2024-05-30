import { Err } from '@lsk4/err';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Exclude, plainToInstance } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min, validate } from 'class-validator';
import { validateAndThrow, validateErrorsAndThrow } from './utils/validateAndTrow';

export class Find<Filter = any> {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsNumber()
  offset: number = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @Exclude()
  filter?: Filter;

  sort: any;

  // Нужно ли возвращать общее количество записей
  @IsOptional()
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
    await validateErrorsAndThrow(validationErrors);
    return findParams;
  },
);
