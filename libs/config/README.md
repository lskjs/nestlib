# Nestlib – Nest Config

> @nestlib/config – Nestlib – Nest config – helpers for config in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/config)](https://www.npmjs.com/package/@nestlib/config)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/config)](https://www.npmjs.com/package/@nestlib/config)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/config)](https://bundlephobia.com/result?p=@nestlib/config)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/config)](https://www.npmjs.com/package/@nestlib/config)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/config)](https://bundlephobia.com/result?p=@nestlib/config)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/config)](https://bundlephobia.com/result?p=@nestlib/config)
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
    *   [Using ConfigService](#using-configservice)
    *   [Environment Variables](#environment-variables)
    *   [Namespaced Configuration](#namespaced-configuration)
    *   [Dynamic Module Registration](#dynamic-module-registration)
*   [📚 API Reference](#-api-reference)
    *   [ConfigModule](#configmodule)
    *   [ConfigService](#configservice)
    *   [InjectConfig](#injectconfig)
    *   [getConfig](#getconfig)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/config

# yarn
yarn add @nestlib/config

# npm
npm i @nestlib/config
```

# 📖 Features

- ⚙️ **Powerful configuration management** for NestJS applications
- 🌍 **Environment-based configuration** with automatic .env file detection
- 📦 **Built on top of @nestjs/config** with extended functionality
- 🔑 **Type-safe configuration** access with TypeScript support
- 🏷️ **Namespace support** for multiple configuration instances
- 🎯 **Selective configuration loading** with field picking
- 🔄 **Dynamic configuration** with custom loaders
- 📝 **Integration with @lsk4/config** for advanced config loading
- 🌲 **Hierarchical .env file resolution** (searches up directory tree)
- 💉 **Dependency injection** support with custom decorators

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlib/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
```

The module will automatically search for `.env` files in the current directory and parent directories (`.env`, `../.env`, `../../.env`).

## Using ConfigService

### Inject and Access Configuration

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestlib/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  getApiUrl(): string {
    return this.configService.get('API_URL');
  }

  getDatabaseConfig() {
    return {
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      name: this.configService.get('DB_NAME'),
    };
  }
}
```

### Using InjectConfig Decorator

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@nestlib/config';
import { ConfigService } from '@nestlib/config';

@Injectable()
export class MyService {
  constructor(
    @InjectConfig() private configService: ConfigService,
  ) {}

  getConfig() {
    return this.configService.get('SOME_VALUE');
  }
}
```

## Environment Variables

Create a `.env` file in your project root:

```env
# Application
APP_NAME=MyApp
APP_PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=secret

# API
API_URL=https://api.example.com
API_KEY=your-api-key
```

## Namespaced Configuration

Use namespaces to organize multiple configuration instances:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlib/config';

@Module({
  imports: [
    // Default namespace
    ConfigModule.forRoot(),
    
    // Custom namespace for database
    ConfigModule.forRoot({
      ns: 'database',
      key: 'database',
    }),
    
    // Custom namespace for redis
    ConfigModule.forRoot({
      ns: 'redis',
      key: 'redis',
    }),
  ],
})
export class AppModule {}
```

Inject namespaced configuration:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@nestlib/config';
import { ConfigService } from '@nestlib/config';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectConfig('database') private dbConfig: ConfigService,
  ) {}

  getConnectionString() {
    return this.dbConfig.get('connectionString');
  }
}
```

## Dynamic Module Registration

### Using getConfig Helper

The `getConfig` helper provides a convenient way to inject configuration into other modules:

```typescript
import { Module } from '@nestjs/common';
import { getConfig } from '@nestlib/config';

@Module({
  imports: [
    SomeModule.forRootAsync(getConfig('database')),
  ],
})
export class AppModule {}
```

### Picking Specific Fields

```typescript
import { Module } from '@nestjs/common';
import { getConfig } from '@nestlib/config';

@Module({
  imports: [
    // Pick specific fields
    DatabaseModule.forRootAsync(
      getConfig('database', ['host', 'port', 'username', 'password'])
    ),
    
    // Pick all fields
    RedisModule.forRootAsync(
      getConfig('redis')
    ),
  ],
})
export class AppModule {}
```

### Using Custom Transform Function

```typescript
import { Module } from '@nestjs/common';
import { getConfig } from '@nestlib/config';

@Module({
  imports: [
    DatabaseModule.forRootAsync(
      getConfig('database', (config) => ({
        url: `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`,
        ssl: config.ssl === 'true',
      }))
    ),
  ],
})
export class AppModule {}
```

### Loading Entire Configuration

```typescript
import { Module } from '@nestjs/common';
import { getConfig } from '@nestlib/config';

@Module({
  imports: [
    // Get all configuration
    SomeModule.forRootAsync(getConfig()),
    
    // Get and transform all configuration
    AnotherModule.forRootAsync(
      getConfig((config) => ({
        apiUrl: config.API_URL,
        timeout: parseInt(config.TIMEOUT || '5000'),
      }))
    ),
  ],
})
export class AppModule {}
```

# 📚 API Reference

## ConfigModule

Main module for configuration management.

### `ConfigModule.forRoot(options?: ConfigModuleOptions)`

Initialize the configuration module.

**Options:**

```typescript
interface ConfigModuleOptions {
  // Namespace for this configuration instance
  ns?: string;
  
  // Key to extract from loaded config, or function to transform config
  key?: string | ((config: any) => any);
  
  // Name of the configuration file (default: '.env')
  name?: string;
  
  // Current working directory (default: process.cwd())
  cwd?: string;
  
  // Additional options from @lsk4/config LoadConfigOptions
  // ...
}
```

**Examples:**

```typescript
// Basic usage
ConfigModule.forRoot()

// With custom working directory
ConfigModule.forRoot({
  cwd: '/path/to/config',
})

// With key extraction
ConfigModule.forRoot({
  key: 'database',
})

// With key transformation
ConfigModule.forRoot({
  key: (config) => config.services.api,
})

// With namespace
ConfigModule.forRoot({
  ns: 'myapp',
})
```

## ConfigService

Service for accessing configuration values.

### Methods

#### `get(key: string): any`

Get configuration value by key.

**Parameters:**
- `key` - The configuration key to retrieve

**Returns:** The configuration value

**Example:**

```typescript
const apiUrl = configService.get('API_URL');
const dbHost = configService.get('database.host');
```

**Note:** The service includes built-in logging for debugging configuration access.

## InjectConfig

Decorator for injecting ConfigService with optional namespace.

### `@InjectConfig(namespace?: string)`

**Parameters:**
- `namespace` - (optional) The namespace of the configuration to inject

**Examples:**

```typescript
// Inject default configuration
constructor(@InjectConfig() private config: ConfigService) {}

// Inject namespaced configuration
constructor(@InjectConfig('database') private dbConfig: ConfigService) {}
```

## getConfig

Helper function for dynamic module registration with configuration.

### Signatures

```typescript
// Get all configuration
getConfig(): GetConfigResult

// Get configuration with field selection or transformation
getConfig(fields: string[] | PropsFn): GetConfigResult

// Get nested configuration path
getConfig(path: string): GetConfigResult

// Get nested configuration with field selection or transformation
getConfig(path: string, fields: string[] | PropsFn): GetConfigResult
```

**Parameters:**
- `path` - (optional) Dot-notation path to nested configuration
- `fields` - (optional) Array of field names to pick, or transformation function

**Returns:** Object with `imports`, `useFactory`, and `inject` for dynamic module registration

**Examples:**

```typescript
// Get entire configuration
SomeModule.forRootAsync(getConfig())

// Get nested path
DatabaseModule.forRootAsync(getConfig('database'))

// Pick specific fields
ApiModule.forRootAsync(getConfig(['API_URL', 'API_KEY']))

// Transform configuration
RedisModule.forRootAsync(
  getConfig('redis', (config) => ({
    host: config.host,
    port: parseInt(config.port),
  }))
)

// Nested path with field picking
DbModule.forRootAsync(
  getConfig('database', ['host', 'port', 'name'])
)
```

# 🔧 Configuration

The module requires the following dependencies:

- `@nestjs/common` - NestJS common utilities
- `@nestjs/config` - Official NestJS configuration module
- `@nestjs/core` - NestJS core functionality
- `@lsk4/config` - Advanced configuration loading
- `@lsk4/log` - Logging utilities
- `@lsk4/err` - Error handling
- `@lsk4/algos` - Algorithm utilities (for picking fields)
- `dotenv` - Environment variable loading

### Environment File Resolution

The module automatically searches for `.env` files in the following order:
1. `{cwd}/.env`
2. `{cwd}/../.env`
3. `{cwd}/../../.env`

The first file found will be used.

### Variable Expansion

The module supports variable expansion in `.env` files:

```env
BASE_URL=https://api.example.com
API_V1_URL=${BASE_URL}/v1
API_V2_URL=${BASE_URL}/v2
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
