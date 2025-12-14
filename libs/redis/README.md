# Nestlib – Nest Redis

> @nestlib/redis – Nestlib – Nest redis – helpers for redis in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/redis)](https://www.npmjs.com/package/@nestlib/redis)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/redis)](https://www.npmjs.com/package/@nestlib/redis)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/redis)](https://bundlephobia.com/result?p=@nestlib/redis)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/redis)](https://www.npmjs.com/package/@nestlib/redis)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/redis)](https://bundlephobia.com/result?p=@nestlib/redis)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/redis)](https://bundlephobia.com/result?p=@nestlib/redis)
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
    *   [Using RedisService](#using-redisservice)
    *   [Multiple Connections](#multiple-connections)
    *   [Async Configuration](#async-configuration)
*   [📚 API Reference](#-api-reference)
    *   [RdsModule](#rdsmodule)
    *   [RedisService](#redisservice)
    *   [InjectRedisService](#injectredisservice)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/redis

# yarn
yarn add @nestlib/redis

# npm
npm i @nestlib/redis
```

# 📖 Features

- 🔌 **Redis integration** for NestJS applications using `@liaoliaots/nestjs-redis`
- 🌐 **Global module** that can be imported once and used throughout the application
- 🔑 **Multiple connections** support with namespace-based connection management
- 📦 **TypeScript support** with full type definitions
- 🎯 **Simple API** for accessing Redis clients
- 🔄 **Async configuration** support for dynamic Redis setup
- 📝 **Built-in logging** using `@lsk4/log`

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { RdsModule } from '@nestlib/redis';

@Module({
  imports: [
    RdsModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
        // Optional: specify connection name
        connection: 'default',
      },
    }),
  ],
})
export class AppModule {}
```

## Using RedisService

### Injecting RedisService

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService, InjectRedisService } from '@nestlib/redis';
import Redis from 'ioredis';

@Injectable()
export class MyService {
  constructor(
    @InjectRedisService() private readonly redisService: RedisService,
  ) {}

  async setValue(key: string, value: string) {
    const client = this.redisService.getClient();
    await client.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    const client = this.redisService.getClient();
    return await client.get(key);
  }
}
```

### Using with Namespace

```typescript
@Injectable()
export class MyService {
  constructor(
    @InjectRedisService('cache') private readonly cacheRedis: RedisService,
    @InjectRedisService('session') private readonly sessionRedis: RedisService,
  ) {}

  async setCache(key: string, value: string) {
    const client = this.cacheRedis.getClient();
    await client.set(key, value);
  }

  async setSession(key: string, value: string) {
    const client = this.sessionRedis.getClient();
    await client.set(key, value);
  }
}
```

### Direct Client Access

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@nestlib/redis';
import Redis from 'ioredis';

@Injectable()
export class MyService {
  constructor(private readonly redisService: RedisService) {}

  async performOperations() {
    // Get default client
    const defaultClient = this.redisService.getClient();
    await defaultClient.set('key', 'value');

    // Get client by namespace
    const cacheClient = this.redisService.getClient('cache');
    await cacheClient.set('cache:key', 'value');

    // Use all Redis commands from ioredis
    await defaultClient.hset('hash', 'field', 'value');
    await defaultClient.lpush('list', 'item');
    await defaultClient.sadd('set', 'member');
  }
}
```

## Multiple Connections

```typescript
import { Module } from '@nestjs/common';
import { RdsModule } from '@nestlib/redis';

@Module({
  imports: [
    RdsModule.forRoot({
      config: [
        {
          host: 'localhost',
          port: 6379,
          connection: 'cache',
        },
        {
          host: 'localhost',
          port: 6380,
          connection: 'session',
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Async Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RdsModule } from '@nestlib/redis';

@Module({
  imports: [
    RdsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
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

# 📚 API Reference

## RdsModule

Global module for Redis integration.

### `RdsModule.forRoot(options)`

Initialize the Redis module synchronously.

**Options:**
- `config` - Redis configuration object or array of configurations
  - `host` - Redis host (default: `localhost`)
  - `port` - Redis port (default: `6379`)
  - `password` - Redis password (optional)
  - `connection` - Connection name/namespace (optional)
  - Other ioredis options

**Example:**
```typescript
RdsModule.forRoot({
  config: {
    host: 'localhost',
    port: 6379,
    connection: 'default',
  },
})
```

### `RdsModule.forRootAsync(options)`

Initialize the Redis module asynchronously.

**Options:**
- `imports` - Array of modules to import
- `useFactory` - Factory function that returns configuration
- `inject` - Array of dependencies to inject into factory
- `useClass` - Class to use as configuration provider
- `useExisting` - Existing provider to use

**Example:**
```typescript
RdsModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    config: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
  }),
  inject: [ConfigService],
})
```

## RedisService

Service for accessing Redis clients.

### Methods

#### `getClient(namespace?: string): Redis`

Get Redis client instance.

**Parameters:**
- `namespace` - (optional) Connection namespace/name. If not provided, returns default client.

**Returns:** `Redis` - ioredis client instance

**Example:**
```typescript
const client = redisService.getClient();
const cacheClient = redisService.getClient('cache');
```

## InjectRedisService

Decorator for injecting RedisService.

### `@InjectRedisService(connection?: string)`

Inject RedisService with optional connection namespace.

**Parameters:**
- `connection` - (optional) Connection name/namespace

**Example:**
```typescript
constructor(
  @InjectRedisService() private readonly redisService: RedisService,
)

// With namespace
constructor(
  @InjectRedisService('cache') private readonly cacheRedis: RedisService,
)
```

# 🔧 Configuration

The module is built on top of `@liaoliaots/nestjs-redis` and supports all ioredis configuration options.

## Basic Configuration

```typescript
RdsModule.forRoot({
  config: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  },
})
```

## Multiple Connections

```typescript
RdsModule.forRoot({
  config: [
    {
      host: 'localhost',
      port: 6379,
      connection: 'cache',
    },
    {
      host: 'localhost',
      port: 6380,
      connection: 'session',
      password: 'session-password',
    },
  ],
})
```

## Environment Variables

```typescript
RdsModule.forRootAsync({
  useFactory: () => ({
    config: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
  }),
})
```

## Available Options

All ioredis options are supported. Common options include:

- `host` - Redis server hostname
- `port` - Redis server port
- `password` - Redis password
- `db` - Database number
- `family` - IP family (4 or 6)
- `keepAlive` - Keep-alive in milliseconds
- `connectTimeout` - Connection timeout in milliseconds
- `lazyConnect` - Wait until `connect()` is called
- `retryStrategy` - Retry strategy function
- `maxRetriesPerRequest` - Maximum retries per request

For complete list, see [ioredis documentation](https://github.com/redis/ioredis).

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
