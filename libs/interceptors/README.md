# Nestlib – Nest Interceptors

> @nestlib/interceptors – Nestlib – Nest interceptors – helpers for interceptors in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/interceptors)](https://www.npmjs.com/package/@nestlib/interceptors)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/interceptors)](https://www.npmjs.com/package/@nestlib/interceptors)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/interceptors)](https://bundlephobia.com/result?p=@nestlib/interceptors)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/interceptors)](https://www.npmjs.com/package/@nestlib/interceptors)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/interceptors)](https://bundlephobia.com/result?p=@nestlib/interceptors)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/interceptors)](https://bundlephobia.com/result?p=@nestlib/interceptors)
[![Package size](https://badgen.net//github/license/lskjs/lskjs)](https://github.com/lskjs/lskjs/blob/master/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<!-- template file="scripts/templates/preview.md" start -->

<!-- template end -->

***

<!-- # 📒 Table of contents  -->

# Table of contents

*   [⌨️ Install](#️-install)
*   [📖 Features](#-features)
*   [🚀 Usage](#-usage)
    *   [Basic Setup](#basic-setup)
    *   [Using ResponseInterceptor](#using-responseinterceptor)
    *   [Using ErrorInterceptor](#using-errorinterceptor)
    *   [Using UseAnyInterceptor](#using-useanyinterceptor)
    *   [Using UseController](#using-usecontroller)
    *   [Response Format](#response-format)
    *   [Error Format](#error-format)
*   [📚 API Reference](#-api-reference)
    *   [ResponseInterceptor](#responseinterceptor)
    *   [ErrorInterceptor](#errorinterceptor)
    *   [UseAnyInterceptor](#useanyinterceptor)
    *   [UseController](#usecontroller)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/interceptors

# yarn
yarn add @nestlib/interceptors

# npm
npm i @nestlib/interceptors
```

# 📖 Features

- 🎯 **Standardized response format** for all API endpoints
- 🛡️ **Error handling** with automatic error formatting and logging
- 🔍 **Debug information** based on environment (dev, beta, production)
- 📊 **Pretty error printing** in development mode
- 🎨 **Flexible response wrapping** with support for custom formats
- 🔧 **Easy-to-use decorators** for applying interceptors
- 📝 **TypeScript support** with full type definitions
- 🚀 **Zero configuration** - works out of the box

# 🚀 Usage

## Basic Setup

The interceptors can be used globally or per controller/method. Here are the main ways to use them:

### Global Setup

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor, ErrorInterceptor } from '@nestlib/interceptors';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
  ],
})
export class AppModule {}
```

## Using ResponseInterceptor

The `ResponseInterceptor` automatically wraps all successful responses in a standardized format:

```typescript
import { Controller, Get } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '@nestlib/interceptors';

@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  @Get()
  getUsers() {
    return { users: [{ id: 1, name: 'John' }] };
  }
}
```

**Response format:**
```json
{
  "ok": 1,
  "code": 0,
  "data": {
    "users": [{ "id": 1, "name": "John" }]
  }
}
```

## Using ErrorInterceptor

The `ErrorInterceptor` catches and formats all errors:

```typescript
import { Controller, Get, HttpException } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { ErrorInterceptor } from '@nestlib/interceptors';

@Controller('users')
@UseInterceptors(ErrorInterceptor)
export class UsersController {
  @Get(':id')
  getUser(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('User not found', 404);
    }
    return { id, name: 'John' };
  }
}
```

**Error response format:**
```json
{
  "ok": 0,
  "code": "err404",
  "message": "User not found",
  "status": 404
}
```

## Using UseAnyInterceptor

The `UseAnyInterceptor` decorator applies both `ResponseInterceptor` and `ErrorInterceptor` at once:

```typescript
import { Controller, Get } from '@nestjs/common';
import { UseAnyInterceptor } from '@nestlib/interceptors';

@Controller('users')
@UseAnyInterceptor()
export class UsersController {
  @Get()
  getUsers() {
    return { users: [] };
  }

  @Get('error')
  getError() {
    throw new Error('Something went wrong');
  }
}
```

You can also add custom interceptors:

```typescript
@Controller('users')
@UseAnyInterceptor(MyCustomInterceptor)
export class UsersController {
  // ...
}
```

## Using UseController

The `UseController` decorator combines `@Controller()` with interceptors:

```typescript
import { Get } from '@nestjs/common';
import { UseController } from '@nestlib/interceptors';

@UseController('users')
export class UsersController {
  @Get()
  getUsers() {
    return { users: [] };
  }
}
```

With custom interceptors:

```typescript
@UseController('users', {
  ResponseInterptor: MyResponseInterceptor,
  ErrorInterceptor: MyErrorInterceptor,
  interceptors: [MyCustomInterceptor],
})
export class UsersController {
  // ...
}
```

To disable default interceptors:

```typescript
@UseController('users', {
  ResponseInterptor: null, // Disable response interceptor
  ErrorInterceptor: MyCustomErrorInterceptor,
})
export class UsersController {
  // ...
}
```

## Response Format

### Successful Response

By default, responses are wrapped in a standard format:

```typescript
{
  ok: 1,
  code: 0,
  data: { /* your data */ }
}
```

### Custom Response Format

You can control the response format using special properties:

```typescript
@Get('custom')
getCustom() {
  // Return raw response (no wrapping)
  return { __raw: 'Plain text response' };
}

@Get('unwrapped')
getUnwrapped() {
  // Return unwrapped object (no ok/code wrapper)
  return { __pack: false, message: 'Hello', data: { id: 1 } };
}

@Get('status')
getWithStatus() {
  // Set custom HTTP status
  return { __status: 201, message: 'Created' };
}
```

## Error Format

### Basic Error

```typescript
throw new HttpException('User not found', 404);
```

**Response:**
```json
{
  "ok": 0,
  "code": "err404",
  "message": "User not found",
  "status": 404
}
```

### Error with Custom Code

```typescript
import { Err } from '@lsk4/err';

throw new Err('USER_NOT_FOUND', 'User not found', { status: 404 });
```

**Response:**
```json
{
  "ok": 0,
  "code": "USER_NOT_FOUND",
  "message": "User not found",
  "status": 404
}
```

### Error with Debug Information

In development mode, additional debug information is included:

```json
{
  "ok": 0,
  "code": "err500",
  "message": "Internal Server Error",
  "status": 500,
  "debug": {
    "additionalInfo": "value"
  },
  "stack": ["Error: ...", "at ..."]
}
```

### Debug Levels

The error interceptor uses different debug levels based on environment:

- **Development (isDev)**: Level 3 - Full debug information
- **Dev server (stage=dev)**: Level 2 - Internal errors with debug
- **Beta server (stage=beta)**: Level 1 - Only code and message
- **Production**: Level 0 - Generic error messages for internal errors

# 📚 API Reference

## ResponseInterceptor

Intercepts successful responses and wraps them in a standard format.

### Methods

#### `intercept(context: ExecutionContext, next: CallHandler): Observable<any>`

Intercepts the response and wraps it using the `pack` utility function.

**Returns:** `Observable<any>` - Wrapped response

## ErrorInterceptor

Intercepts errors and formats them according to the environment and error type.

### Methods

#### `intercept(context: ExecutionContext, next: CallHandler): Observable<any>`

Intercepts errors and formats them with appropriate status codes and messages.

**Features:**
- Extracts error code and message using `@lsk4/err`
- Determines HTTP status code from error
- Applies debug level based on environment
- Logs errors with pretty printing in development
- Formats stack traces for client responses

**Returns:** `Observable<any>` - Formatted error response

## UseAnyInterceptor

Decorator factory that applies both `ResponseInterceptor` and `ErrorInterceptor`.

### Signature

```typescript
function UseAnyInterceptor(...interceptors: (Function | NestInterceptor<any, any>)[]): ClassDecorator & MethodDecorator
```

### Parameters

- `...interceptors` - Additional interceptors to apply

### Example

```typescript
@UseAnyInterceptor(MyCustomInterceptor)
export class MyController {
  // ...
}
```

## UseController

Decorator factory that combines `@Controller()` with interceptors.

### Signature

```typescript
function UseController(
  path: string | string[],
  options?: UseControllerOptions
): ClassDecorator
```

### Parameters

- `path` - Controller route path(s)
- `options` - (optional) Configuration options:
  - `ResponseInterptor` - Custom response interceptor (default: `ResponseInterceptor`)
  - `ErrorInterceptor` - Custom error interceptor (default: `ErrorInterceptor`)
  - `interceptors` - Additional interceptors array

### Example

```typescript
@UseController('api/users', {
  ResponseInterptor: MyResponseInterceptor,
  ErrorInterceptor: MyErrorInterceptor,
  interceptors: [LoggingInterceptor],
})
export class UsersController {
  // ...
}
```

# 🔧 Configuration

The interceptors use environment variables and configuration from `@lsk4/env`:

- `isDev` - Development mode flag (affects debug level)
- `stage` - Environment stage (`dev`, `beta`, `production`)

### Response Formatting

The `pack` utility function handles response formatting. You can control it using special properties in your response:

- `__raw` - Return raw response without JSON wrapping
- `__pack: false` - Skip standard wrapping format
- `__status` - Set custom HTTP status code
- `__log` - Additional logging information

### Error Handling

The error interceptor automatically:

- Extracts error codes and messages
- Determines appropriate HTTP status codes
- Filters sensitive debug information in production
- Logs errors with pretty formatting in development
- Includes stack traces when appropriate

### Pretty Error Printing

In development mode, errors are printed using `pretty-error` with custom styling. The interceptor:

- Skips Node.js internal files
- Skips NestJS core files
- Formats stack traces for better readability
- Logs errors at appropriate levels

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
