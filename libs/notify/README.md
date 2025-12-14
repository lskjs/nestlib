# Nestlib – Nest Notify

> @nestlib/notify – Nestlib – Nest notify – notification sender for NestJS projects using Telegram, Slack, or emails

[![LSK logo](https://badgen.net/badge/icon/MADE%20BY%20LSK?icon=zeit\&label\&color=red\&labelColor=red)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/notify)](https://www.npmjs.com/package/@nestlib/notify)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/notify)](https://www.npmjs.com/package/@nestlib/notify)
[![NPM Dependency count](https://badgen.net/bundlephobia/dependency-count/@nestlib/notify)](https://bundlephobia.com/result?p=@nestlib/notify)
[![Have TypeScript types](https://badgen.net/npm/types/@nestlib/notify)](https://www.npmjs.com/package/@nestlib/notify)
[![Have tree shaking](https://badgen.net/bundlephobia/tree-shaking/@nestlib/notify)](https://bundlephobia.com/result?p=@nestlib/notify)
[![NPM Package size](https://badgen.net/bundlephobia/minzip/@nestlib/notify)](https://bundlephobia.com/result?p=@nestlib/notify)
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
    *   [Sending Notifications](#sending-notifications)
    *   [Log Levels](#log-levels)
    *   [Multiple Instances](#multiple-instances)
*   [📚 API Reference](#-api-reference)
    *   [NotifyModule](#notifymodule)
    *   [NotifyService](#notifyservice)
    *   [InjectNotifyService](#injectnotifyservice)
*   [🔧 Configuration](#-configuration)
*   [📖 License](#-license)
*   [👥 Contributors](#-contributors)
*   [👏 Contributing](#-contributing)
*   [📮 Any questions? Always welcome :)](#-any-questions-always-welcome-)

# ⌨️ Install

```sh
# pnpm
pnpm add @nestlib/notify

# yarn
yarn add @nestlib/notify

# npm
npm i @nestlib/notify
```

# 📖 Features

- 📨 **Multi-channel notifications** via Telegram, Slack, or email
- 🎯 **Log level methods** (trace, debug, info, warn, error, fatal)
- 🔧 **Flexible configuration** with synchronous and asynchronous setup
- 🏷️ **Namespace support** for multiple notification instances
- 📝 **TypeScript support** with full type definitions
- 🎨 **Rich message formatting** with titles, tags, users, and links
- 🔌 **Easy integration** with NestJS dependency injection

# 🚀 Usage

## Basic Setup

### Synchronous Configuration

```typescript
import { Module } from '@nestjs/common';
import { NotifyModule } from '@nestlib/notify';

@Module({
  imports: [
    NotifyModule.forRoot({
      namespace: 'default', // optional
      // RlogOptions configuration
      // telegram: { token: 'YOUR_TELEGRAM_BOT_TOKEN', chatId: 'YOUR_CHAT_ID' },
      // slack: { webhookUrl: 'YOUR_SLACK_WEBHOOK_URL' },
      // email: { /* email configuration */ },
    }),
  ],
})
export class AppModule {}
```

### Asynchronous Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotifyModule } from '@nestlib/notify';

@Module({
  imports: [
    NotifyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        namespace: 'default',
        telegram: {
          token: configService.get('TELEGRAM_BOT_TOKEN'),
          chatId: configService.get('TELEGRAM_CHAT_ID'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using Options Factory Class

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifyModuleOptionsFactory, NotifyModuleOptions } from '@nestlib/notify';

@Injectable()
export class NotifyConfigService implements NotifyModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createNotifyModuleOptions(): NotifyModuleOptions {
    return {
      namespace: 'default',
      telegram: {
        token: this.configService.get('TELEGRAM_BOT_TOKEN'),
        chatId: this.configService.get('TELEGRAM_CHAT_ID'),
      },
    };
  }
}

@Module({
  imports: [
    NotifyModule.forRootAsync({
      useClass: NotifyConfigService,
    }),
  ],
})
export class AppModule {}
```

## Sending Notifications

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { NotifyService } from '@nestlib/notify';

@Injectable()
export class MyService {
  constructor(private notifyService: NotifyService) {}

  async sendNotification() {
    await this.notifyService.send({
      message: 'Hello, World!',
    });
  }

  async sendRichNotification() {
    await this.notifyService.send(
      {
        message: 'User registered successfully',
      },
      {
        title: 'New User Registration',
        tags: ['user', 'registration'],
        users: ['@username'],
        links: [
          { title: 'View User', url: 'https://example.com/user/123', style: 'primary' },
        ],
        props: {
          userId: '123',
          email: 'user@example.com',
        },
      },
    );
  }
}
```

### Using InjectNotifyService Decorator

```typescript
import { Injectable } from '@nestjs/common';
import { InjectNotifyService, NotifyService } from '@nestlib/notify';

@Injectable()
export class MyService {
  constructor(
    @InjectNotifyService('default') private notifyService: NotifyService,
  ) {}

  async sendNotification() {
    await this.notifyService.send({
      message: 'Notification from default instance',
    });
  }
}
```

## Log Levels

The service provides methods for different log levels:

```typescript
@Injectable()
export class MyService {
  constructor(private notifyService: NotifyService) {}

  async logExamples() {
    // Trace level (lowest priority)
    this.notifyService.trace({ message: 'Trace message' });

    // Debug level
    this.notifyService.debug({ message: 'Debug message' });

    // Info level
    this.notifyService.info({ message: 'Info message' });

    // Warning level
    this.notifyService.warn({ message: 'Warning message' });

    // Error level
    this.notifyService.error({ message: 'Error message' });

    // Fatal level (highest priority)
    this.notifyService.fatal({ message: 'Fatal message' });
  }
}
```

### Using Log Levels with Options

```typescript
this.notifyService.error(
  { message: 'Database connection failed' },
  {
    title: 'Database Error',
    tags: ['database', 'error'],
    links: [
      { title: 'View Logs', url: 'https://example.com/logs', style: 'danger' },
    ],
  },
);
```

## Multiple Instances

You can create multiple notification instances with different namespaces:

```typescript
@Module({
  imports: [
    NotifyModule.forRoot({
      namespace: 'alerts',
      telegram: { token: 'ALERT_BOT_TOKEN', chatId: 'ALERT_CHAT_ID' },
    }),
    NotifyModule.forRoot({
      namespace: 'notifications',
      slack: { webhookUrl: 'NOTIFICATION_WEBHOOK_URL' },
    }),
  ],
})
export class AppModule {}

// Usage
@Injectable()
export class MyService {
  constructor(
    @InjectNotifyService('alerts') private alertService: NotifyService,
    @InjectNotifyService('notifications') private notificationService: NotifyService,
  ) {}

  async sendAlert() {
    await this.alertService.error({ message: 'Critical alert!' });
  }

  async sendNotification() {
    await this.notificationService.info({ message: 'Regular notification' });
  }
}
```

# 📚 API Reference

## NotifyModule

### `NotifyModule.forRoot(options)`

Initialize the notification module with synchronous configuration.

**Options:**
- `namespace` - (optional) Namespace for this instance
- All `RlogOptions` from `@lsk4/rlog` (telegram, slack, email, etc.)

**Example:**
```typescript
NotifyModule.forRoot({
  namespace: 'default',
  telegram: { token: 'BOT_TOKEN', chatId: 'CHAT_ID' },
})
```

### `NotifyModule.forRootAsync(options)`

Initialize the notification module with asynchronous configuration.

**Options:**
- `namespace` - (optional) Namespace for this instance
- `useFactory` - Factory function that returns configuration
- `useClass` - Class that implements `NotifyModuleOptionsFactory`
- `useExisting` - Existing provider that implements `NotifyModuleOptionsFactory`
- `inject` - Dependencies to inject into the factory
- `imports` - Modules to import

**Example:**
```typescript
NotifyModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    telegram: { token: config.get('TELEGRAM_TOKEN') },
  }),
  inject: [ConfigService],
})
```

## NotifyService

Main service for sending notifications.

### Methods

#### `send(props: RlogSendData, options?: NotifySendOptions)`

Send a notification with custom options.

**Parameters:**
- `props` - Notification data (message, etc.)
- `options` - (optional) Additional options:
  - `title` - Notification title
  - `tags` - Array of tags
  - `users` - Array of user mentions
  - `links` - Array of links (string or object with title, url, style)
  - `props` - Additional properties as key-value pairs

**Returns:** `Promise<any>`

#### `trace(data: RlogSendData, options?: NotifySendOptions)`

Send a trace-level notification.

#### `debug(data: RlogSendData, options?: NotifySendOptions)`

Send a debug-level notification.

#### `info(data: RlogSendData, options?: NotifySendOptions)`

Send an info-level notification.

#### `warn(data: RlogSendData, options?: NotifySendOptions)`

Send a warning-level notification.

#### `error(data: RlogSendData, options?: NotifySendOptions)`

Send an error-level notification.

#### `fatal(data: RlogSendData, options?: NotifySendOptions)`

Send a fatal-level notification.

## InjectNotifyService

Decorator for injecting a specific notification service instance by namespace.

### `@InjectNotifyService(namespace?: string)`

Inject a notification service instance.

**Parameters:**
- `namespace` - (optional) Namespace of the instance to inject

**Example:**
```typescript
constructor(
  @InjectNotifyService('alerts') private alertService: NotifyService,
) {}
```

# 🔧 Configuration

The module is built on top of `@lsk4/rlog` and supports all Rlog configuration options:

- **Telegram**: Configure Telegram bot token and chat ID
- **Slack**: Configure Slack webhook URL
- **Email**: Configure email sending options
- **Other channels**: Any channel supported by `@lsk4/rlog`

For detailed configuration options, refer to the [@lsk4/rlog documentation](https://github.com/lskjs/lskjs/tree/main/packages/rlog).

**Example configuration:**

```typescript
NotifyModule.forRoot({
  namespace: 'default',
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
  },
  email: {
    // Email configuration
  },
})
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
