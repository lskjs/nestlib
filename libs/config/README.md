# ⚙️ @nestlib/config – Configuration Module for NestJS

[![LSK.js](https://github.com/lskjs/presets/raw/main/docs/badge.svg)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/config)](https://www.npmjs.com/package/@nestlib/config)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/config)](https://www.npmjs.com/package/@nestlib/config)
[![Package size](https://badgen.net/bundlephobia/minzip/@nestlib/config)](https://bundlephobia.com/result?p=@nestlib/config)
[![Package size](https://badgen.net/github/license/nestlibs/nestlib)](https://github.com/nestlibs/nestlib/blob/main/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<div align="center">
  <p><strong>❤️‍🔥 Powerful configuration management for NestJS applications ❤️‍🔥</strong></p>
</div>

<img src="https://github.com/nestlibs/nestlib/raw/main/docs/logo.png" align="right" width="120" height="120" />

**⚙️ Environment-based**: Automatic `.env` file detection and hierarchical resolution  
**🔑 Type-safe**: Full TypeScript support with strict typing  
**🏷️ Namespaces**: Multiple configuration instances with namespace support  
**🔄 Dynamic**: Custom loaders and async module registration  
**📦 Multiple formats**: `.env`, `.js`, `.ts`, `.json` configuration files  
**💉 DI Support**: Dependency injection with custom decorators

## 🚀 Quick Start

```bash
# pnpm
pnpm add @nestlib/config

# yarn
yarn add @nestlib/config

# npm
npm i @nestlib/config
```

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlib/config';

@Module({
  imports: [
    ConfigModule.forRootAsync(), // will automatically read the .env & .env.js & .env.ts files
  ],
})
export class AppModule {}

The module will automatically search for `.env` files in the current directory and parent directories (`.env`, `../.env`, `../../.env`).

## ✨ Features

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
- 🔀 **Async module registration** with `forRootAsync` for dynamic options
- 📄 **Multiple file formats**: `.env`, `.js`, `.ts`, `.json` configuration files

## 📖 Usage

### Using ConfigService

#### Inject and Access Configuration

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

#### Using InjectConfig Decorator

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

### Environment Variables

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

### Namespaced Configuration

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

### Dynamic Module Registration

#### Using getConfig Helper

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

#### Picking Specific Fields

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

#### Using Custom Transform Function

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

### Async Configuration with forRootAsync

Use `forRootAsync` when you need to load configuration options dynamically:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlib/config';

@Module({
  imports: [
    ConfigModule.forRootAsync({
      useFactory: async () => ({
        name: 'env.config',
        cwd: '/path/to/config',
        throwError: true,
      }),
    }),
  ],
})
export class AppModule {}
```

### Configuration File Types

The module supports multiple configuration file formats:

#### .env Files

```env
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
API_KEY=secret123
```

#### JavaScript/TypeScript Configuration Files

```typescript
// env.config.ts
export default {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp',
  },
  api: {
    url: 'https://api.example.com',
    timeout: 5000,
  },
};
```

Load with:

```typescript
ConfigModule.forRoot({
  name: 'env.config',
})
```

## 📚 API Reference

### ConfigModule

#### `ConfigModule.forRoot(options?: ConfigModuleOptions)`

Initialize the configuration module synchronously.

**Options:**

```typescript
interface ConfigModuleOptions {
  ns?: string;           // Namespace for this configuration instance
  key?: string | ((config: any) => any);  // Key to extract from loaded config
  name?: string;         // Name of the configuration file (default: '.env')
  cwd?: string;          // Current working directory (default: process.cwd())
  throwError?: boolean;  // Whether to throw error if config file not found
}
```

#### `ConfigModule.forRootAsync(options?: ConfigModuleAsyncOptions)`

Initialize the configuration module asynchronously.

```typescript
interface ConfigModuleAsyncOptions {
  ns?: string;           // Namespace for this configuration instance
  imports?: any[];       // Modules to import
  inject?: InjectionToken[];  // Dependencies to inject into useFactory
  useFactory?: (...args: any[]) => Promise<ConfigModuleOptions> | ConfigModuleOptions;
  useClass?: Type<ConfigOptionsFactory>;
  useExisting?: Type<ConfigOptionsFactory>;
}
```

### ConfigService

Service for accessing configuration values.

```typescript
const apiUrl = configService.get('API_URL');
const dbHost = configService.get('database.host');
```

### InjectConfig

Decorator for injecting ConfigService with optional namespace.

```typescript
// Inject default configuration
constructor(@InjectConfig() private config: ConfigService) {}

// Inject namespaced configuration
constructor(@InjectConfig('database') private dbConfig: ConfigService) {}
```

### getConfig

Helper function for dynamic module registration with configuration.

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
```

## 🔧 Configuration

### Environment File Resolution

The module automatically searches for `.env` files in the following order:
1. `{cwd}/.env`
2. `{cwd}/../.env`
3. `{cwd}/../../.env`

### File Type Detection

| File Pattern | Type | Parser |
|--------------|------|--------|
| `.env` | Environment | dotenv |
| `*.config` (without `.js`/`.ts`/`.json`) | Environment | dotenv |
| `*.js` | JavaScript | @lsk4/config |
| `*.ts` | TypeScript | @lsk4/config |
| `*.json` | JSON | @lsk4/config |

### Variable Expansion

The module supports variable expansion in `.env` files:

```env
BASE_URL=https://api.example.com
API_V1_URL=${BASE_URL}/v1
API_V2_URL=${BASE_URL}/v2
```

## 📝 License

MIT © [Igor Suvorov](https://github.com/isuvorov)

## 🔗 Links

* [GitHub Repository](https://github.com/nestlibs/nestlib)
* [Issues](https://github.com/nestlibs/nestlib/issues)
* [Telegram](https://t.me/lskjschat)

---

**@nestlib/config** – _Powerful configuration management for NestJS_ ⚙️
