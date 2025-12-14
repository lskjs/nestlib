# Nestlib – Nest Mutex

> @nestlib/mutex – Nestlib – Nest mutex – helpers for mutex in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/mutex)](https://www.npmjs.com/package/@nestlib/mutex)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/mutex)](https://www.npmjs.com/package/@nestlib/mutex)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/mutex)](https://bundlephobia.com/result?p=@nestlib/mutex)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/mutex)](https://www.npmjs.com/package/@nestlib/mutex)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/mutex)](https://bundlephobia.com/result?p=@nestlib/mutex)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/mutex)](https://bundlephobia.com/result?p=@nestlib/mutex)
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
    *   [Using Lock Decorator](#using-lock-decorator)
    *   [Using Mutex Decorator](#using-mutex-decorator)
    *   [Using LockService](#using-lockservice)
*   [📚 API Reference](#-api-reference)
    *   [LockModule](#lockmodule)
    *   [LockService](#lockservice)
    *   [Lock Decorator](#lock-decorator)
    *   [Mutex Decorator](#mutex-decorator)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/mutex

# yarn
yarn add @nestlib/mutex

# npm
npm i @nestlib/mutex
```

# 📖 Features

- 🔒 **Distributed locking** support with Redis or in-memory locks
- 🎯 **Method-level locking** with `@Lock` decorator
- 🛡️ **Controller-level locking** with `@Mutex` decorator
- ⚡ **Async lock support** using async-lock library
- 🔴 **Redis integration** for distributed systems
- ⏱️ **Configurable timeouts** for lock acquisition
- 📝 **TypeScript support** with full type definitions
- 🎨 **Flexible key generation** with function-based keys

# 🚀 Usage

## Basic Setup

### In-Memory Locking (Default)

```typescript
import { Module } from '@nestjs/common';
import { LockModule } from '@nestlib/mutex';

@Module({
  imports: [
    LockModule.register({
      // No redisOptions = in-memory locking
    }),
  ],
})
export class AppModule {}
```

### Redis-Based Locking

```typescript
import { Module } from '@nestjs/common';
import { LockModule } from '@nestlib/mutex';

@Module({
  imports: [
    LockModule.register({
      redisOptions: {
        host: '127.0.0.1',
        port: '6379',
        password: 'your-password', // optional
      },
    }),
  ],
})
export class AppModule {}
```

### Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { LockModule } from '@nestlib/mutex';

@Module({
  imports: [
    LockModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        redisOptions: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Using Lock Decorator

The `@Lock` decorator provides method-level locking to prevent concurrent execution of the same method.

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { Lock } from '@nestlib/mutex';

@Injectable()
export class PaymentService {
  @Lock()
  async processPayment(userId: string, amount: number) {
    // This method will be locked per method name
    // Only one execution at a time
    return { success: true };
  }
}
```

### Custom Lock Key

```typescript
import { Injectable } from '@nestjs/common';
import { Lock } from '@nestlib/mutex';

@Injectable()
export class UserService {
  @Lock({ key: 'user-update' })
  async updateUser(userId: string, data: any) {
    // Locked with custom key 'user-update'
    return { updated: true };
  }

  @Lock({ key: (userId: string) => `user-${userId}` })
  async updateUserProfile(userId: string, data: any) {
    // Locked with dynamic key based on userId
    // Different users can execute concurrently
    return { updated: true };
  }
}
```

### With Timeout Configuration

```typescript
import { Injectable } from '@nestjs/common';
import { Lock } from '@nestlib/mutex';

@Injectable()
export class OrderService {
  @Lock({
    key: (orderId: string) => `order-${orderId}`,
    timeout: 10000, // 10 seconds timeout
  })
  async processOrder(orderId: string) {
    // Lock will timeout after 10 seconds
    return { processed: true };
  }
}
```

## Using Mutex Decorator

The `@Mutex` decorator provides controller-level locking using NestJS interceptors.

```typescript
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Mutex } from '@nestlib/mutex';

@Controller('orders')
export class OrdersController {
  @Post('checkout')
  @Mutex('order-checkout')
  async checkout(@Req() req: Request, @Body() data: any) {
    // This endpoint will be locked with key 'order-checkout'
    return { success: true };
  }
}
```

## Using LockService

For programmatic lock management, inject `LockService` directly.

```typescript
import { Injectable } from '@nestjs/common';
import { LockService, LOCK } from '@nestlib/mutex';

@Injectable()
export class InventoryService {
  constructor(@Inject(LOCK) private lockService: LockService) {}

  async updateStock(productId: string, quantity: number) {
    return this.lockService.acquire(
      `product-${productId}`,
      async () => {
        // Critical section - only one execution at a time per productId
        const currentStock = await this.getStock(productId);
        const newStock = currentStock + quantity;
        await this.setStock(productId, newStock);
        return newStock;
      },
      { timeout: 5000 }, // 5 seconds timeout
    );
  }
}
```

### Multiple Operations with Same Lock

```typescript
@Injectable()
export class AccountService {
  constructor(@Inject(LOCK) private lockService: LockService) {}

  async transfer(fromAccount: string, toAccount: string, amount: number) {
    // Lock both accounts to prevent deadlocks
    const lockKey = [fromAccount, toAccount].sort().join('-');
    
    return this.lockService.acquire(
      `transfer-${lockKey}`,
      async () => {
        // Both accounts are locked
        await this.debit(fromAccount, amount);
        await this.credit(toAccount, amount);
        return { success: true };
      },
      { timeout: 30000 },
    );
  }
}
```

# 📚 API Reference

## LockModule

Module for providing lock functionality in NestJS applications.

### `LockModule.register(options: LockOptions)`

Register the module with synchronous options.

**Options:**
- `redisOptions` - (optional) Redis configuration for distributed locking
  - `host` - Redis host (default: '127.0.0.1')
  - `port` - Redis port (default: '6379')
  - `password` - (optional) Redis password

**Example:**
```typescript
LockModule.register({
  redisOptions: {
    host: 'localhost',
    port: '6379',
  },
})
```

### `LockModule.registerAsync(options: LockAsyncOptions)`

Register the module with asynchronous options.

**Options:**
- `useFactory` - Factory function that returns lock options
- `useExisting` - Use existing options factory
- `useClass` - Use class-based options factory
- `inject` - Dependencies to inject into factory
- `imports` - Modules to import

**Example:**
```typescript
LockModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    redisOptions: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
  }),
  inject: [ConfigService],
})
```

## LockService

Service for managing locks programmatically.

### Methods

#### `acquire(key: string, cb: () => Promise<any>, options: LockFunctionOptions)`

Acquire a lock and execute a callback function.

**Parameters:**
- `key` - Unique lock key
- `cb` - Callback function to execute while holding the lock
- `options` - Lock options
  - `timeout` - Maximum time to wait for lock acquisition (default: 60000ms)

**Returns:** Promise resolving to the result of the callback function

**Example:**
```typescript
await lockService.acquire(
  'my-lock-key',
  async () => {
    // Critical section
    return await doSomething();
  },
  { timeout: 5000 },
);
```

## Lock Decorator

### `@Lock(options?: LockDecoratorOptions)`

Method decorator that automatically locks method execution.

**Options:**
- `key` - (optional) Lock key (string or function that returns string)
- `timeout` - (optional) Lock timeout in milliseconds
- Other `AsyncLockOptions` from async-lock library

**Example:**
```typescript
@Lock({ key: 'my-key', timeout: 10000 })
async myMethod() {
  // Locked execution
}
```

## Mutex Decorator

### `@Mutex(key: string)`

Controller method decorator that locks endpoint execution using interceptors.

**Parameters:**
- `key` - Lock key for the endpoint

**Example:**
```typescript
@Mutex('endpoint-lock')
@Post('action')
async performAction() {
  // Locked endpoint
}
```

# 🔧 Configuration

The module supports two locking strategies:

## In-Memory Locking

When no `redisOptions` are provided, the module uses in-memory locking via `async-lock`. This is suitable for:
- Single-instance applications
- Development environments
- Simple use cases

**Limitations:**
- Locks are not shared across multiple application instances
- Locks are lost on application restart

## Redis-Based Locking

When `redisOptions` are provided, the module uses Redis for distributed locking via `redis-lock`. This is suitable for:
- Multi-instance applications
- Distributed systems
- Production environments requiring lock persistence

**Requirements:**
- Redis server running and accessible
- Redis client connection configured

**Note:** Redis locks automatically expire after the timeout period, while in-memory locks wait for the timeout before allowing the next execution.

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
