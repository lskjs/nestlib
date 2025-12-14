# Nestlib – Nest Decorators

> @nestlib/decorators – Nestlib – Nest decorators – custom parameter decorators and transformers for NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/decorators)](https://www.npmjs.com/package/@nestlib/decorators)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/decorators)](https://www.npmjs.com/package/@nestlib/decorators)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/decorators)](https://bundlephobia.com/result?p=@nestlib/decorators)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/decorators)](https://www.npmjs.com/package/@nestlib/decorators)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/decorators)](https://bundlephobia.com/result?p=@nestlib/decorators)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/decorators)](https://bundlephobia.com/result?p=@nestlib/decorators)
[![Package size](https://badgen.net//github/license/lskjs/lskjs)](https://github.com/lskjs/lskjs/blob/main/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<!-- template file="scripts/templates/preview.md" start -->

<!-- template end -->

***

<!-- # 📒 Table of contents  -->

# Table of contents

*   [⌨️ Install](#️-install)
*   [📖 Features](#-features)
*   [🚀 Usage](#-usage)
    *   [Data Decorator](#data-decorator)
    *   [Query Decorator](#query-decorator)
    *   [QueryOrBody Decorator](#queryorbody-decorator)
    *   [FindParams Decorator](#findparams-decorator)
    *   [Transformers](#transformers)
*   [📚 API Reference](#-api-reference)
    *   [Data](#data)
    *   [Query](#query)
    *   [QueryOrBody](#queryorbody)
    *   [FindParams](#findparams)
    *   [Trim](#trim)
    *   [ToLowerCase](#tolowercase)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/decorators

# yarn
yarn add @nestlib/decorators

# npm
npm i @nestlib/decorators
```

# 📖 Features

- 🎯 **Custom parameter decorators** for flexible data extraction
- ✅ **Automatic validation** using class-validator
- 🔄 **Data transformation** with class-transformer
- 📊 **Pagination support** with FindParams decorator
- 🔍 **Flexible query handling** with multiple property support
- 🧹 **String transformers** for trimming and case conversion
- 📝 **TypeScript support** with full type definitions
- 🚀 **Easy integration** with existing NestJS applications

# 🚀 Usage

## Data Decorator

The `@Data()` decorator is a powerful tool for extracting and validating data from requests.

### Basic Usage with DTO

```typescript
import { Controller, Post } from '@nestjs/common';
import { Data } from '@nestlib/decorators';
import { IsString, IsEmail, MinLength } from 'class-validator';

class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}

@Controller('users')
export class UsersController {
  @Post()
  async create(@Data(CreateUserDto) data: CreateUserDto) {
    // Data is validated and transformed into an instance of CreateUserDto
    return { message: 'User created', data };
  }
}
```

### Extract from Specific Key

```typescript
@Post('with-key')
async createWithKey(@Data({ Dto: CreateUserDto, key: 'userData' }) data: CreateUserDto) {
  // Extracts data from request.body.userData or request.query.userData
  return data;
}
```

### Extract from Multiple Keys (Priority Order)

```typescript
@Post('with-keys')
async createWithKeys(@Data({ Dto: CreateUserDto, keys: ['props', 'data', 'body'] }) data: CreateUserDto) {
  // Searches for data in props, then data, then body
  return data;
}
```

### Without DTO (Raw Data)

```typescript
@Post('raw')
async createRaw(@Data() data: any) {
  // Returns merged query and body without validation
  return data;
}

@Post('raw-key')
async createRawKey(@Data('settings') data: any) {
  // Returns data from specific key without validation
  return data;
}
```

## Query Decorator

Enhanced query parameter extraction with multiple property support.

### Single Property

```typescript
import { Controller, Get } from '@nestjs/common';
import { Query } from '@nestlib/decorators';

@Controller('posts')
export class PostsController {
  @Get()
  async findOne(@Query('id') id: string) {
    // Extracts id from query string
    return { id };
  }
}
```

### Multiple Properties (Fallback)

```typescript
@Get('item')
async findItem(@Query(['_id', 'id', 'itemId']) id: string) {
  // Tries _id first, then id, then itemId
  // Returns the first non-undefined value
  return { id };
}
```

## QueryOrBody Decorator

Extract parameter from either query string or request body.

```typescript
import { Controller, Post } from '@nestjs/common';
import { QueryOrBody } from '@nestlib/decorators';

@Controller('search')
export class SearchController {
  @Post()
  async search(@QueryOrBody('query') searchQuery: string) {
    // Checks query string first, then body
    return { query: searchQuery };
  }
}
```

## FindParams Decorator

Comprehensive pagination and filtering support.

### Basic Pagination

```typescript
import { Controller, Get } from '@nestjs/common';
import { FindParams, Find } from '@nestlib/decorators';

@Controller('products')
export class ProductsController {
  @Get()
  async findAll(@FindParams() params: Find) {
    // params contains: limit, offset, search, sort, count
    const { limit = 10, offset = 0, search, sort, count } = params;
    
    // Use params for database query
    return {
      data: [],
      total: count ? 100 : undefined,
    };
  }
}
```

### With Custom Filter DTO

```typescript
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

class ProductFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Max(10000)
  maxPrice?: number;
}

@Controller('products')
export class ProductsController {
  @Get()
  async findWithFilter(
    @FindParams({ filterDTO: ProductFilterDto }) params: Find<ProductFilterDto>
  ) {
    const { limit, offset, filter } = params;
    
    // filter is validated ProductFilterDto instance
    const { category, minPrice, maxPrice } = filter || {};
    
    return {
      limit,
      offset,
      category,
      priceRange: [minPrice, maxPrice],
    };
  }
}
```

### Find Class Properties

The `Find` class provides:
- `limit` - Number of items to return (1-100, default: 10)
- `offset` - Number of items to skip (default: 0)
- `search` - Search query string (optional)
- `filter` - Custom filter object (optional)
- `sort` - Sort parameters (optional)
- `count` - Whether to return total count (boolean, default: false)

## Transformers

Property transformers for automatic data transformation in DTOs.

### Trim Transformer

```typescript
import { Trim } from '@nestlib/decorators/transformers';
import { IsString } from 'class-validator';

class CreateArticleDto {
  @IsString()
  @Trim()
  title: string;

  @IsString()
  @Trim({ strategy: 'start' })
  content: string;

  @IsString()
  @Trim({ strategy: 'end' })
  tags: string;
}

// Usage
const dto = plainToInstance(CreateArticleDto, {
  title: '  My Article  ',      // -> 'My Article'
  content: '  Some content',     // -> 'Some content'
  tags: 'tag1, tag2  ',          // -> 'tag1, tag2'
});
```

### ToLowerCase Transformer

```typescript
import { ToLowerCase } from '@nestlib/decorators/transformers';
import { IsString, IsEmail } from 'class-validator';

class LoginDto {
  @IsEmail()
  @ToLowerCase()
  email: string;

  @IsString()
  password: string;
}

// Usage
const dto = plainToInstance(LoginDto, {
  email: 'USER@EXAMPLE.COM',  // -> 'user@example.com'
  password: 'MyPassword',     // -> 'MyPassword' (unchanged)
});
```

### Combined Transformers

```typescript
import { Trim, ToLowerCase } from '@nestlib/decorators/transformers';
import { IsEmail } from 'class-validator';

class SubscribeDto {
  @IsEmail()
  @Trim()
  @ToLowerCase()
  email: string;
}

// Usage
const dto = plainToInstance(SubscribeDto, {
  email: '  USER@EXAMPLE.COM  ',  // -> 'user@example.com'
});
```

# 📚 API Reference

## Data

Custom parameter decorator for extracting and validating data from requests.

### Signatures

```typescript
// With DTO class
@Data(DtoClass)

// With DTO and specific key
@Data({ Dto: DtoClass, key: 'propertyName' })

// With DTO and multiple keys (priority order)
@Data({ Dto: DtoClass, keys: ['prop1', 'prop2', 'prop3'] })

// With specific key only (no validation)
@Data('propertyName')

// With multiple keys only (no validation)
@Data(['prop1', 'prop2', 'prop3'])

// Without arguments (merged query and body)
@Data()
```

### Parameters

- `DtoClass` - DTO class for validation and transformation
- `key` - Single property name to extract from request
- `keys` - Array of property names (checks in order, returns first found)

### Returns

Validated and transformed DTO instance or raw data.

### Throws

Validation errors with status 400 if data doesn't match DTO constraints.

## Query

Extract query parameters with fallback support.

### Signatures

```typescript
// Single property
@Query('propertyName')

// Multiple properties (fallback order)
@Query(['prop1', 'prop2', 'prop3'])
```

### Parameters

- `property` - String or array of strings representing query parameter names

### Returns

Value of the first non-undefined property found in the query string.

## QueryOrBody

Extract parameter from query string or request body.

### Signature

```typescript
@QueryOrBody('propertyName')
```

### Parameters

- `property` - Property name to extract

### Returns

Value from `request.query[property]` or `request.body[property]` (query has priority).

## FindParams

Decorator for pagination and filtering parameters.

### Signature

```typescript
// Basic usage
@FindParams()

// With custom filter DTO
@FindParams({ filterDTO: FilterDtoClass })
```

### Parameters

- `filterDTO` - (optional) DTO class for validating filter object

### Returns

`Find` instance with properties:
- `limit: number` - Items per page (1-100, default: 10)
- `offset: number` - Number of items to skip (default: 0)
- `search?: string` - Search query
- `filter?: T` - Validated filter object (if filterDTO provided)
- `sort: any` - Sort parameters
- `count?: boolean` - Whether to return total count (default: false)

### Throws

Validation errors if parameters don't match constraints.

## Trim

Property transformer for trimming strings.

### Signature

```typescript
@Trim(options?: TrimOptions, transformOptions?: TransformOptions)
```

### Options

```typescript
interface TrimOptions {
  strategy?: 'start' | 'end' | 'both'; // default: 'both'
}
```

- `'both'` - Trim from both ends (default)
- `'start'` - Trim from start only
- `'end'` - Trim from end only

### Example

```typescript
class MyDto {
  @Trim()
  name: string;

  @Trim({ strategy: 'start' })
  description: string;
}
```

## ToLowerCase

Property transformer for converting strings to lowercase.

### Signature

```typescript
@ToLowerCase(transformOptions?: TransformOptions)
```

### Example

```typescript
class MyDto {
  @ToLowerCase()
  email: string;

  @ToLowerCase()
  username: string;
}
```

# 🔧 Configuration

The module requires the following dependencies:

- `@nestjs/common` - NestJS common utilities
- `class-validator` - Validation decorators and functions
- `class-transformer` - Transformation decorators and functions
- `@lsk4/err` - Error handling utilities

### Validation

The module uses `class-validator` for validation. When validation fails, it throws an error with:
- Status code: `400`
- Structure:
  ```typescript
  {
    message: 'Validation Error',
    status: 400,
    data: [
      {
        property: 'email',
        message: 'email must be an email'
      },
      // ... more errors
    ]
  }
  ```

### Transformation

The module uses `class-transformer` with `enableImplicitConversion: true` for automatic type conversion:
```typescript
// String to number
class MyDto {
  @IsNumber()
  age: number;
}

// Input: { age: "25" }
// Output: { age: 25 }
```

***

# 📖 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

# 👥 Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore-start -->

<!-- markdownlint-disable -->

<table>
  <tr>
    <td align="center"><a href="https://isuvorov.com"><img src="https://avatars2.githubusercontent.com/u/1056977?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Igor Suvorov</b></sub></a><br /><a href="lskjs/lskjs///commits?author=isuvorov" title="Code">💻</a> <a href="#design-isuvorov" title="Design">🎨</a> <a href="#ideas-isuvorov" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

# 👏 Contributing

1.  Fork it (<https://github.com/yourname/yourproject/fork>)
2.  Create your feature branch (`git checkout -b features/fooBar`)
3.  Commit your changes (`git commit -am 'feat(image): Add some fooBar'`)
4.  Push to the branch (`git push origin feature/fooBar`)
5.  Create a new Pull Request

# 📮 Any questions? Always welcome :)

*   [Email](mailto:hi@isuvorov.com)
*   [LSK.news – Telegram channel](https://t.me/lskjs)
*   [Спроси нас в телеграме ;)](https://t.me/lskjschat)
