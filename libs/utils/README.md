# Nestlib – Nest Utils

> @nestlib/utils – Nestlib – Nest utils – helpers and utils for NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/utils)](https://www.npmjs.com/package/@nestlib/utils)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/utils)](https://www.npmjs.com/package/@nestlib/utils)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/utils)](https://bundlephobia.com/result?p=@nestlib/utils)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/utils)](https://www.npmjs.com/package/@nestlib/utils)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/utils)](https://bundlephobia.com/result?p=@nestlib/utils)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/utils)](https://bundlephobia.com/result?p=@nestlib/utils)
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
    *   [Exception Filter](#exception-filter)
    *   [Validation Pipe](#validation-pipe)
    *   [Logger](#logger)
    *   [Time Decorator](#time-decorator)
*   [📚 API Reference](#-api-reference)
    *   [AnyExceptionFilter](#anyexceptionfilter)
    *   [AnyValidationPipe](#anyvalidationpipe)
    *   [createNestLogger](#createnestlogger)
    *   [Time Decorator](#time-decorator-1)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/utils

# yarn
yarn add @nestlib/utils

# npm
npm i @nestlib/utils
```

# 📖 Features

- 🛡️ **Exception Filter** for structured error handling with automatic logging
- ✅ **Validation Pipe** with custom error formatting using Err class
- 📝 **Logger Service** compatible with NestJS LoggerService using @lsk4/log
- ⏱️ **Time Decorator** for measuring method execution time
- 🔍 **Debug support** with detailed error information in development mode
- 📊 **Structured logging** with different log levels based on error status
- 🎯 **TypeScript support** with full type definitions

# 🚀 Usage

## Exception Filter

The `AnyExceptionFilter` provides structured error handling and logging for your NestJS application.

### Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AnyExceptionFilter } from '@nestlib/utils';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AnyExceptionFilter,
    },
  ],
})
export class AppModule {}
```

### Error Response Format

The filter automatically formats errors into a consistent response structure:

```json
{
  "ok": 0,
  "code": "err400",
  "message": "Validation Error",
  "data": { ... },
  "debug": { ... } // Only in debug mode
}
```

## Validation Pipe

The `AnyValidationPipe` extends NestJS ValidationPipe with custom error formatting.

### Global Setup

```typescript
import { NestFactory } from '@nestjs/core';
import { AnyValidationPipe } from '@nestlib/utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new AnyValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
```

### Validation Error Format

Validation errors are automatically formatted:

```json
{
  "ok": 0,
  "code": "err400",
  "message": "Validation Error",
  "data": [
    {
      "property": "email",
      "message": "email must be an email"
    },
    {
      "property": "password",
      "message": ["password must be longer than or equal to 8 characters", "password must contain at least one number"]
    }
  ]
}
```

## Logger

Create a NestJS compatible logger using `@lsk4/log` under the hood.

### Basic Usage

```typescript
import { Module } from '@nestjs/common';
import { createNestLogger } from '@nestlib/utils';

const logger = createNestLogger({
  level: 'info',
  context: 'AppModule',
});

@Module({})
export class AppModule {
  onModuleInit() {
    logger.log('Application initialized', 'AppModule');
    logger.info('Server started', 'AppModule');
    logger.warn('Warning message', 'AppModule');
    logger.error('Error message', 'AppModule');
  }
}
```

### Using with NestFactory

```typescript
import { NestFactory } from '@nestjs/core';
import { createNestLogger } from '@nestlib/utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = createNestLogger({
    level: 'info',
  });
  
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  await app.listen(3000);
}
bootstrap();
```

### Available Log Levels

- `verbose` / `log` - Maps to `trace` level
- `debug` - Debug level
- `info` - Info level
- `warn` - Warning level
- `error` - Error level
- `fatal` - Fatal level

## Time Decorator

Measure execution time of methods using the `@Time()` decorator.

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { Time } from '@nestlib/utils';

@Injectable()
export class UserService {
  @Time()
  async findAll() {
    // This method execution time will be logged
    return await this.repository.find();
  }

  @Time('custom-method-name')
  async findOne(id: string) {
    // Logged with custom key: "custom-method-name"
    return await this.repository.findOne(id);
  }
}
```

### Log Output

The decorator automatically logs execution time:

```
[Time] UserService.findAll 45ms
[Time] custom-method-name 12ms
```

# 📚 API Reference

## AnyExceptionFilter

Global exception filter that catches `Err` instances and formats them into structured responses.

### Methods

#### `catch(err: Err, host: ArgumentsHost)`

Catches and processes exceptions.

**Parameters:**
- `err: Err` - The error instance to handle
- `host: ArgumentsHost` - NestJS execution context

**Returns:** HTTP response with structured error format

#### `logError(err: Err, logInfo: Record<string, unknown>, host: ArgumentsHost)`

Logs error information based on status code and context type.

**Log Levels:**
- `error` + `trace` - For status >= 500 (server errors)
- `trace` - For 401, 403, 404 (authentication/authorization errors)
- `debug` + `trace` - For other 4xx errors
- `trace` - For 200 status with error code
- `debug` + `trace` - For other status codes

## AnyValidationPipe

Extended ValidationPipe with custom error formatting.

### Constructor

```typescript
new AnyValidationPipe(options?: ValidationPipeOptions)
```

**Options:** Standard NestJS ValidationPipeOptions

**Features:**
- Automatically formats validation errors into Err format
- Combines multiple constraint messages into arrays
- Returns structured error response with status 400

## createNestLogger

Creates a logger service compatible with NestJS LoggerService.

### Function Signature

```typescript
createNestLogger(props?: ILoggerOptions): LoggerService
```

### Options

```typescript
interface ILoggerOptions {
  env?: string;
  context?: string;
  level?: LoggerLevelType;
  logGroupName?: string;
  params?: any;
  ns?: string;
}
```

### Returns

LoggerService with methods:
- `verbose(name: string, ...args: any[])`
- `log(name: string, ...args: any[])`
- `debug(name: string, ...args: any[])`
- `info(name: string, ...args: any[])`
- `warn(name: string, ...args: any[])`
- `error(name: string, ...args: any[])`
- `fatal(name: string, ...args: any[])`
- `setLogLevels()`

## Time Decorator

### `@Time(key?: string)`

Measures and logs method execution time.

**Parameters:**
- `key?: string` - Optional custom key for logging. Defaults to `ClassName.methodName`

**Usage:**
```typescript
@Time()                    // Logs as "ClassName.methodName"
@Time('custom-key')        // Logs as "custom-key"
```

# 🔧 Configuration

## Environment Variables

- `DEBUG` - Enable deep debug mode for detailed error information
- `NODE_ENV` - Environment mode (affects error formatting)

## Dependencies

The package requires the following peer dependencies:

- `@nestjs/common` - NestJS core
- `@nestjs/config` - Configuration management

## Error Response Structure

The exception filter returns errors in the following format:

```typescript
{
  ok: 0,
  code: string,           // Error code (e.g., "err400", "err500")
  message?: string,       // Human-readable error message
  data?: any,            // Additional error data
  debug?: any            // Debug information (only in debug mode)
}
```

## Logging Context Types

The filter automatically detects context type:
- `http` - HTTP requests (uses `web` logger)
- `rmq` - RabbitMQ messages (uses `rmq:exception` logger)

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
