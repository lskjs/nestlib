# Nestlib – Nest MikroORM

> @nestlib/mikro-orm – Nestlib – Nest MikroORM – logger factory for MikroORM in NestJS projects

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/mikro-orm)](https://www.npmjs.com/package/@nestlib/mikro-orm)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/mikro-orm)](https://www.npmjs.com/package/@nestlib/mikro-orm)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/mikro-orm)](https://bundlephobia.com/result?p=@nestlib/mikro-orm)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/mikro-orm)](https://www.npmjs.com/package/@nestlib/mikro-orm)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/mikro-orm)](https://bundlephobia.com/result?p=@nestlib/mikro-orm)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/mikro-orm)](https://bundlephobia.com/result?p=@nestlib/mikro-orm)
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
    *   [MikroORM Configuration](#mikroorm-configuration)
    *   [Logger Levels](#logger-levels)
*   [📚 API Reference](#-api-reference)
    *   [loggerFactory](#loggerfactory)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/mikro-orm

# yarn
yarn add @nestlib/mikro-orm

# npm
npm i @nestlib/mikro-orm
```

# 📖 Features

- 🔌 **MikroORM integration** with LSK logger system
- 📊 **Query logging** with automatic performance monitoring
- ⚡ **Performance tracking** - automatically logs slow queries as warnings
- 🎯 **Namespace-based logging** - separate loggers for different ORM operations
- 📝 **TypeScript support** with full type definitions
- 🔍 **Query formatting** - clean and readable query logs
- ⏱️ **Execution time tracking** - shows query duration in human-readable format
- 📈 **Results count** - displays number of returned records

# 🚀 Usage

## Basic Setup

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { loggerFactory } from '@nestlib/mikro-orm';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      // ... your MikroORM config
      logger: loggerFactory,
    }),
  ],
})
export class AppModule {}
```

## MikroORM Configuration

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { loggerFactory } from '@nestlib/mikro-orm';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      type: 'mongo',
      clientUrl: 'mongodb://localhost:27017',
      dbName: 'myapp',
      entities: [User, Post],
      logger: loggerFactory,
      debug: true, // Enable query logging
    }),
  ],
})
export class AppModule {}
```

## Logger Levels

The logger factory automatically determines log levels based on query performance:

- **`trace`** - Fast queries (< 5 seconds)
- **`debug`** - Medium queries (5-60 seconds)
- **`warn`** - Slow queries (> 60 seconds) or warnings from MikroORM
- **`error`** - Errors from MikroORM

Example log output:

```
orm:query trace users.find({ email: 'user@example.com' }) [1] 2.3ms
orm:query debug posts.find({ published: true }).limit(10) [10] 5.2s
orm:query warn slowQuery.find({ complex: true }) [100] 1.2m
```

# 📚 API Reference

## loggerFactory

### `loggerFactory(options: LoggerOptions): Logger`

Creates a logger instance for MikroORM that integrates with the LSK logging system.

**Parameters:**
- `options` - Logger options from MikroORM (currently not used, but required by interface)

**Returns:** `Logger` - MikroORM logger instance

**Logger Methods:**

#### `logQuery(context: LogContext)`
Logs database queries with performance metrics.

**Context properties:**
- `level` - Log level from MikroORM ('warning' | 'error' | undefined)
- `query` - SQL/MongoDB query string
- `params` - Query parameters
- `took` - Query execution time in milliseconds
- `results` - Number of returned records

#### `log(ns: LoggerNamespace, message: string)`
Logs general messages at debug level.

#### `error(ns: LoggerNamespace, message: string)`
Logs error messages.

#### `warn(ns: LoggerNamespace, message: string)`
Logs warning messages.

#### `setDebugMode()`
Placeholder method (no-op).

#### `isEnabled()`
Returns `true` to indicate logger is always enabled.

**Example:**

```typescript
import { loggerFactory } from '@nestlib/mikro-orm';
import { MikroORM } from '@mikro-orm/core';

const orm = await MikroORM.init({
  // ... config
  logger: loggerFactory,
});
```

# 🔧 Configuration

The module requires the following dependencies:

- `@lsk4/log` - LSK logging system
- `@mikro-orm/core` - MikroORM core (peer dependency)

The logger factory creates namespaced loggers using the pattern `orm:{namespace}`, where namespace can be:
- `query` - Database queries
- `schema` - Schema operations
- `discovery` - Entity discovery
- `info` - General information

Query logs include:
- Formatted query string (cleaned up for readability)
- Query parameters
- Execution time (formatted as human-readable duration)
- Results count (if > 1)

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
