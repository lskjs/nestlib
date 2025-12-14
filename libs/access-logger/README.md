# Nestlib – Nest Access logger

> @nestlib/access-logger – Nestlib – Nest Access logger – HTTP request logging middleware for NestJS

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/access-logger)](https://www.npmjs.com/package/@nestlib/access-logger)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/access-logger)](https://www.npmjs.com/package/@nestlib/access-logger)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/access-logger)](https://bundlephobia.com/result?p=@nestlib/access-logger)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/access-logger)](https://www.npmjs.com/package/@nestlib/access-logger)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/access-logger)](https://bundlephobia.com/result?p=@nestlib/access-logger)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/access-logger)](https://bundlephobia.com/result?p=@nestlib/access-logger)
[![Package size](https://badgen.net//github/license/lskjs/lskjs)](https://github.com/lskjs/lskjs/blob/master/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<!-- template file="scripts/templates/preview.md" start -->

<!-- template end -->

***

<!-- # 📒 Table of contents  -->

# Table of contents

*   [⌨️ Install](#️-install)
*   [📚 Usage](#-usage)
*   [🔧 Features](#-features)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# yarn
yarn i @nestlib/access-logger 

# npm
npm i @nestlib/access-logger 

# pnpm
pnpm i @nestlib/access-logger
```

# 📚 Usage

## Basic Setup

Import and use `AccessLoggerMiddleware` in your NestJS application:

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AccessLoggerMiddleware } from '@nestlib/access-logger';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessLoggerMiddleware)
      .forRoutes('*');
  }
}
```

## Express Middleware

You can also use the Express middleware directly:

```typescript
import { expressAccessLoggerMiddeware } from '@nestlib/access-logger';
import express from 'express';

const app = express();
app.use(expressAccessLoggerMiddeware);
```

## Custom Logger

The middleware will use `req.log` if available, otherwise it will use a default logger:

```typescript
import { ILogger } from '@lsk4/log';

// In your middleware or guard
req.log = yourCustomLogger;
```

# 🔧 Features

- **Request ID Generation**: Automatically generates unique request IDs (using `nanoid` in production, sequential numbers in development)
- **Comprehensive Logging**: Logs method, URL, IP address, user agent, referer, status code, response time, and more
- **Smart Log Levels**: Automatically determines log level based on:
  - HTTP status codes (errors → `error`, client errors → `warn`)
  - Response duration (slow requests → `warn`/`error`)
  - Request errors
- **WebSocket Support**: Special handling for WebSocket connections
- **IP Detection**: Automatically extracts client IP from various headers and connection properties
- **Development Mode**: Enhanced logging in development mode with request body logging

## Logged Data

The middleware logs the following information:

- `method` - HTTP method (GET, POST, etc.) or 'WS' for WebSocket
- `reqId` - Unique request identifier
- `host` - Request host
- `url` - Request URL
- `referer` - Referer header
- `ua` - User agent
- `ip` - Client IP address
- `status` - HTTP status code
- `duration` - Request duration in milliseconds
- `length` - Response content length
- `err` - Error code (if any)

## Log Levels

- `error` - Server errors (5xx), errors, or very slow requests (>10s)
- `warn` - Client errors (4xx) or slow requests (>3s)
- `debug` - Normal successful requests
- `trace` - WebSocket connections and request start events

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
