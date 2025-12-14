# Nestlib – Nest RabbitMQ

> @nestlib/rabbitmq – Nestlib – Nest rabbitmq – helpers for rabbitmq in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/rabbitmq)](https://www.npmjs.com/package/@nestlib/rabbitmq)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/rabbitmq)](https://www.npmjs.com/package/@nestlib/rabbitmq)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/rabbitmq)](https://bundlephobia.com/result?p=@nestlib/rabbitmq)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/rabbitmq)](https://www.npmjs.com/package/@nestlib/rabbitmq)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/rabbitmq)](https://bundlephobia.com/result?p=@nestlib/rabbitmq)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/rabbitmq)](https://bundlephobia.com/result?p=@nestlib/rabbitmq)
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
    *   [Basic Setup](#basic-setup)
    *   [Publishing Messages](#publishing-messages)
    *   [RPC Handlers](#rpc-handlers)
    *   [Request/Response Pattern](#requestresponse-pattern)
    *   [Error Handling](#error-handling)
    *   [Configuration](#configuration)
*   [📚 API Reference](#-api-reference)
    *   [RmqModule](#rmqmodule)
    *   [RmqService](#rmqservice)
    *   [RmqRPC Decorator](#rmqrpc-decorator)
    *   [RmqPayload Decorator](#rmqpayload-decorator)
    *   [RmqInterceptor](#rmqinterceptor)
    *   [RmqErrorCallback](#rmqerrorcallback)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/rabbitmq

# yarn
yarn add @nestlib/rabbitmq

# npm
npm i @nestlib/rabbitmq
```

# 📖 Features

- 🐰 **RabbitMQ integration** for NestJS applications
- 📨 **Message publishing** with automatic logging and timing
- 🔄 **RPC (Remote Procedure Call)** support for request/response patterns
- 🎯 **Decorator-based handlers** for easy message processing
- 🛡️ **Error handling** with retry logic and dead letter queues
- 📊 **Automatic logging** of all message operations
- ⚙️ **Configurable channels** with prefetch count settings
- 🔌 **Multiple connection support** for different RabbitMQ instances
- 📝 **TypeScript support** with full type definitions
- 🚦 **Interceptor-based** message processing with automatic error recovery

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { RmqModule } from '@nestlib/rabbitmq';

@Module({
  imports: [
    RmqModule.forRoot({
      uri: 'amqp://localhost:5672',
      // Optional: connection name for multiple connections
      connection: 'default',
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RmqModule } from '@nestlib/rabbitmq';

@Module({
  imports: [
    RmqModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBITMQ_URI'),
        connection: 'default',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Publishing Messages

```typescript
import { Injectable } from '@nestjs/common';
import { RmqService, InjectRmqService } from '@nestlib/rabbitmq';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRmqService() private readonly rmqService: RmqService,
  ) {}

  async sendNotification(userId: string, message: string) {
    await this.rmqService.publish(
      'notifications',
      'user.notification',
      {
        pattern: 'user.notification',
        data: { userId, message },
        meta: { timestamp: Date.now() },
      },
    );
  }
}
```

## RPC Handlers

### Creating an RPC Handler

```typescript
import { Controller } from '@nestjs/common';
import { RmqRPC, RmqPayload } from '@nestlib/rabbitmq';

@Controller()
export class UserController {
  @RmqRPC({
    exchange: 'users',
    routingKey: 'user.get',
    queue: 'user.get.queue',
    queueOptions: {
      channel: 'users',
    },
    prefetchCount: 10,
  })
  async getUser(@RmqPayload() payload: { userId: string }) {
    const { data } = payload;
    // Process the request
    return { id: data.userId, name: 'John Doe' };
  }
}
```

### Using RmqInterceptor

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqInterceptor } from '@nestlib/rabbitmq';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqInterceptor,
    },
  ],
})
export class AppModule {}
```

The interceptor automatically:
- Validates message data
- Logs processing time
- Handles errors with retry logic
- Tracks delivery attempts
- Returns standardized response format

## Request/Response Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { RmqService, InjectRmqService } from '@nestlib/rabbitmq';

@Injectable()
export class UserService {
  constructor(
    @InjectRmqService() private readonly rmqService: RmqService,
  ) {}

  async getUserData(userId: string) {
    const response = await this.rmqService.request({
      exchange: 'users',
      routingKey: 'user.get',
      timeout: 5000,
      payload: {
        pattern: 'user.get',
        data: { userId },
      },
    });

    return response;
  }
}
```

## Error Handling

### Custom Error Callback

```typescript
import { RmqErrorCallback } from '@nestlib/rabbitmq';

// Use in RmqRPC decorator
@RmqRPC({
  exchange: 'users',
  routingKey: 'user.get',
  errorHandler: RmqErrorCallback,
})
async getUser(@RmqPayload() payload: any) {
  // Handler implementation
}
```

### Error Response Format

The interceptor returns errors in a standardized format:

```typescript
{
  code: 0, // 0 for success, non-zero for errors
  data: any, // Response data
  message: 'ok', // Status message
  meta: {
    data: any, // Original request data
    meta: any, // Original request meta
    startedAt: Date,
    finishedAt: Date,
    duration: number, // Processing time in ms
    attempts?: number, // Number of retry attempts
  },
}
```

## Configuration

### Setting Global Configuration

```typescript
import { setRmqConfig } from '@nestlib/rabbitmq';

setRmqConfig({
  errDelay: 100, // Delay before retry (ms)
  maxAttempts: 20, // Maximum retry attempts
  isLog: true, // Enable detailed logging
  channels: {
    users: {
      prefetchCount: 10, // Prefetch count for users channel
    },
  },
});
```

### Configuration Options

- `errDelay` - Delay in milliseconds before retrying failed messages (default: 100ms in production, 1000ms in development)
- `maxAttempts` - Maximum number of retry attempts before giving up (default: 20 in production, 3 in development)
- `isLog` - Enable detailed logging (default: false)
- `channels.{channelName}.prefetchCount` - Prefetch count for specific channel

# 📚 API Reference

## RmqModule

Main module for RabbitMQ integration.

### `RmqModule.forRoot(options)`

Initialize the RabbitMQ module synchronously.

**Options:**
- `uri` - RabbitMQ connection URI
- `connection` - (optional) Connection name for multiple connections
- All other options from `@golevelup/nestjs-rabbitmq`

**Example:**
```typescript
RmqModule.forRoot({
  uri: 'amqp://localhost:5672',
  connection: 'default',
})
```

### `RmqModule.forRootAsync(options)`

Initialize the RabbitMQ module asynchronously.

**Options:**
- `imports` - Array of modules to import
- `useFactory` - Factory function to create configuration
- `inject` - Array of dependencies to inject

**Example:**
```typescript
RmqModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    uri: config.get('RABBITMQ_URI'),
  }),
  inject: [ConfigService],
})
```

## RmqService

Service for publishing messages and making RPC requests.

### Methods

#### `publish(exchange: string, routingKey: string, payload: RmqRequestPayload, options?: Options.Publish)`

Publish a message to an exchange.

**Parameters:**
- `exchange` - Exchange name
- `routingKey` - Routing key
- `payload` - Message payload with `pattern`, `data`, and optional `meta`
- `options` - (optional) AMQP publish options

**Returns:** `Promise<void>`

#### `request(options: { exchange: string, routingKey: string, timeout: number, payload: RmqRequestPayload })`

Make an RPC request and wait for response.

**Parameters:**
- `exchange` - Exchange name
- `routingKey` - Routing key
- `timeout` - Request timeout in milliseconds
- `payload` - Request payload with `pattern`, `data`, and optional `meta`

**Returns:** `Promise<any>` - Response data

## RmqRPC Decorator

Decorator for creating RPC message handlers.

### `@RmqRPC(props: RmqRPCConfigProps)`

**Properties:**
- `exchange` - Exchange name
- `routingKey` - Routing key pattern
- `queue` - Queue name
- `queueOptions` - Queue options including `channel`
- `prefetchCount` - (optional) Prefetch count (overrides channel config)
- `connection` - (optional) Connection name
- `createQueueIfNotExists` - (optional) Create queue if it doesn't exist
- `errorBehavior` - (optional) Error handling behavior
- `errorHandler` - (optional) Custom error handler function

**Example:**
```typescript
@RmqRPC({
  exchange: 'users',
  routingKey: 'user.*',
  queue: 'user.queue',
  queueOptions: { channel: 'users' },
  prefetchCount: 10,
})
```

## RmqPayload Decorator

Decorator for extracting message payload in handlers.

### `@RmqPayload()`

Extracts the payload from the RabbitMQ message.

**Example:**
```typescript
@RmqRPC({ ... })
async handler(@RmqPayload() payload: { data: { userId: string } }) {
  const { data } = payload;
  // Use data.userId
}
```

## RmqInterceptor

Interceptor for automatic message processing, error handling, and logging.

### Features

- Validates message data
- Logs processing time and status
- Handles errors with automatic retry
- Tracks delivery attempts
- Returns standardized response format
- Supports dead letter queue routing

### Response Format

Success:
```typescript
{
  code: 0,
  data: any,
  message: 'ok',
  meta: { ... },
}
```

Error:
```typescript
{
  code: number, // Error code
  message: string, // Error message
  meta: {
    data: any,
    attempts: number,
    duration: number,
    ...
  },
}
```

## RmqErrorCallback

Callback function for custom error handling in RPC handlers.

### `RmqErrorCallback(channel: RmqChannel, msg: RmqConsumeMessage, err: any)`

Handles errors in RPC handlers:
- Publishes errors to dead letter queue (if status is 300)
- Sends error response to reply queue (if present)
- Acknowledges or nacks messages based on error status

**Error Status Codes:**
- `200` - Skip error (nack without requeue)
- `300` - Send to dead letter queue (nack without requeue)
- Other - Retry message (nack with requeue)

# 🔧 Configuration

The module requires the following dependencies:

- `@golevelup/nestjs-rabbitmq` - RabbitMQ integration for NestJS
- `amqplib` - AMQP client library
- `@lsk4/log` - Logging utilities
- `@lsk4/err` - Error handling utilities
- `rxjs` - Reactive extensions

### Environment Variables

```bash
RABBITMQ_URI=amqp://localhost:5672
```

### Multiple Connections

```typescript
@Module({
  imports: [
    RmqModule.forRoot({
      uri: 'amqp://localhost:5672',
      connection: 'primary',
    }),
    RmqModule.forRoot({
      uri: 'amqp://remote:5672',
      connection: 'secondary',
    }),
  ],
})
export class AppModule {}

// Use specific connection
@Injectable()
export class MyService {
  constructor(
    @InjectRmqService('primary') private readonly primaryRmq: RmqService,
    @InjectRmqService('secondary') private readonly secondaryRmq: RmqService,
  ) {}
}
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
