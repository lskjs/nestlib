# Nestlib – Nest LSK

> @nestlib/lsk – Nestlib – Nest lsk – lsk module wrapper for nestjs

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/lsk)](https://www.npmjs.com/package/@nestlib/lsk)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/lsk)](https://www.npmjs.com/package/@nestlib/lsk)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/lsk)](https://bundlephobia.com/result?p=@nestlib/lsk)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/lsk)](https://www.npmjs.com/package/@nestlib/lsk)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/lsk)](https://bundlephobia.com/result?p=@nestlib/lsk)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/lsk)](https://bundlephobia.com/result?p=@nestlib/lsk)
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
    *   [Async Configuration](#async-configuration)
    *   [Using with Namespace](#using-with-namespace)
    *   [Injecting LSK Module](#injecting-lsk-module)
*   [📚 API Reference](#-api-reference)
    *   [LskModule](#lskmodule)
    *   [LskCoreModule](#lskcoremodule)
    *   [InjectLskModule](#injectlskmodule)
    *   [Types](#types)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/lsk

# yarn
yarn add @nestlib/lsk

# npm
npm i @nestlib/lsk
```

# 📖 Features

- 🔌 **LSK.js integration** for NestJS applications
- 🎯 **Module wrapper** that seamlessly integrates LSK.js modules into NestJS
- 🔄 **Async configuration** support with factory, class, or existing provider patterns
- 🏷️ **Namespace support** for managing multiple LSK module instances
- 🛡️ **Global module** that provides LSK module throughout the application
- 🔚 **Automatic cleanup** with graceful shutdown handling
- 📝 **TypeScript support** with full type definitions
- 🎨 **Dependency injection** ready with custom decorators

# 🚀 Usage

## Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { LskModule } from '@nestlib/lsk';
import { SomeLskModule } from '@lskjs/some-module';

@Module({
  imports: [
    LskModule.forRoot({
      module: SomeLskModule,
      config: {
        // Your LSK module configuration
      },
      modules: {
        // Additional modules if needed
      },
    }),
  ],
})
export class AppModule {}
```

## Async Configuration

### Using Factory

```typescript
import { Module } from '@nestjs/common';
import { LskModule } from '@nestlib/lsk';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LskModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        module: SomeLskModule,
        config: {
          apiKey: configService.get('LSK_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using Class

```typescript
import { Injectable } from '@nestjs/common';
import { LskModule, LskOptionsFactory, LskModuleOptions } from '@nestlib/lsk';

@Injectable()
export class LskConfigService implements LskOptionsFactory {
  createLskOptions(): LskModuleOptions {
    return {
      module: SomeLskModule,
      config: {
        // Your configuration
      },
    };
  }
}

@Module({
  imports: [
    LskModule.forRootAsync({
      useClass: LskConfigService,
    }),
  ],
})
export class AppModule {}
```

### Using Existing Provider

```typescript
@Module({
  imports: [
    LskModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: LskConfigService,
    }),
  ],
})
export class AppModule {}
```

## Using with Namespace

When you need multiple instances of LSK modules, use namespaces:

```typescript
@Module({
  imports: [
    LskModule.forRoot({
      ns: 'primary',
      module: PrimaryLskModule,
      config: { /* ... */ },
    }),
    LskModule.forRoot({
      ns: 'secondary',
      module: SecondaryLskModule,
      config: { /* ... */ },
    }),
  ],
})
export class AppModule {}
```

## Injecting LSK Module

Use the `InjectLskModule` decorator to inject the LSK module instance:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectLskModule } from '@nestlib/lsk';

@Injectable()
export class MyService {
  constructor(
    @InjectLskModule() private readonly lskModule: any,
    // Or with namespace:
    // @InjectLskModule('primary') private readonly primaryLskModule: any,
  ) {}

  async doSomething() {
    // Use the LSK module instance
    await this.lskModule.someMethod();
  }
}
```

# 📚 API Reference

## LskModule

Main module for integrating LSK.js modules into NestJS.

### `LskModule.forRoot(options)`

Initialize the LSK module synchronously.

**Options:**
- `ns` - (optional) Namespace identifier for multiple instances
- `module` - LSK.js module class to initialize
- `config` - (optional) Configuration object for the LSK module
- `modules` - (optional) Additional modules configuration

**Example:**
```typescript
LskModule.forRoot({
  ns: 'my-namespace',
  module: MyLskModule,
  config: { apiKey: 'xxx' },
})
```

### `LskModule.forRootAsync(options)`

Initialize the LSK module asynchronously.

**Options:**
- `ns` - (optional) Namespace identifier for multiple instances
- `imports` - (optional) Array of modules to import
- `useFactory` - Factory function that returns LskModuleOptions
- `useClass` - Class that implements LskOptionsFactory
- `useExisting` - Existing provider that implements LskOptionsFactory
- `inject` - (optional) Array of dependencies to inject into the factory

**Example:**
```typescript
LskModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    module: MyLskModule,
    config: config.get('lsk'),
  }),
  inject: [ConfigService],
})
```

## LskCoreModule

Global core module that handles LSK module initialization and lifecycle.

### Features

- Automatically initializes LSK modules on application startup
- Handles graceful shutdown by calling `stop()` on LSK modules
- Provides LSK module instances via dependency injection
- Supports multiple instances through namespaces

## InjectLskModule

Decorator for injecting LSK module instances.

### `@InjectLskModule(ns?)`

Inject an LSK module instance.

**Parameters:**
- `ns` - (optional) Namespace identifier. If not provided, uses the default instance.

**Example:**
```typescript
constructor(
  @InjectLskModule() private readonly lskModule: any,
  @InjectLskModule('primary') private readonly primaryModule: any,
) {}
```

## Types

### `LskModuleOptions`

Configuration interface for LSK module.

```typescript
interface LskModuleOptions {
  ns?: string;
  module: any;
  config?: any;
  modules?: any;
}
```

### `LskModuleAsyncOptions`

Async configuration interface.

```typescript
interface LskModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  ns?: string;
  useExisting?: Type<LskOptionsFactory>;
  useClass?: Type<LskOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<LskModuleOptions> | LskModuleOptions;
  inject?: any[];
}
```

### `LskOptionsFactory`

Interface for factory classes.

```typescript
interface LskOptionsFactory {
  createLskOptions(): Promise<LskModuleOptions> | LskModuleOptions;
}
```

# 🔧 Configuration

The module requires the following dependencies:

- `@nestjs/common` - NestJS common utilities
- `@nestjs/core` - NestJS core functionality

The LSK module you're wrapping must have a `start()` method that accepts configuration and returns a module instance. The instance should have a `stop()` method for graceful shutdown.

**Example LSK Module Structure:**

```typescript
class MyLskModule {
  static async start(config: any) {
    // Initialize module
    return new MyLskModule(config);
  }

  async stop() {
    // Cleanup resources
  }
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
