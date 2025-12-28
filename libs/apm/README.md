# 📊 @nestlib/apm – APM Module for NestJS

[![LSK.js](https://github.com/lskjs/presets/raw/main/docs/badge.svg)](https://github.com/lskjs)
[![NPM version](https://badgen.net/npm/v/@nestlib/apm)](https://www.npmjs.com/package/@nestlib/apm)
[![NPM downloads](https://badgen.net/npm/dt/@nestlib/apm)](https://www.npmjs.com/package/@nestlib/apm)
[![Package size](https://badgen.net/bundlephobia/minzip/@nestlib/apm)](https://bundlephobia.com/result?p=@nestlib/apm)
[![Package size](https://badgen.net/github/license/nestlibs/nestlib)](https://github.com/nestlibs/nestlib/blob/main/LICENSE)
[![Ask us in Telegram](https://img.shields.io/badge/Ask%20us%20in-Telegram-brightblue.svg)](https://t.me/lskjschat)

<div align="center">
  <p><strong>❤️‍🔥 Elastic APM integration for NestJS applications ❤️‍🔥</strong></p>
</div>

<img src="https://github.com/nestlibs/nestlib/raw/main/docs/logo.png" align="right" width="120" height="120" />

**📊 Elastic APM integration**: Full-featured APM agent integration for NestJS  
**🎯 Transaction tracking**: Automatic and manual transaction management  
**🔍 Span tracking**: Detailed performance monitoring with spans  
**🎨 Decorators**: `@ApmTrack` and `@ApmSpan` for easy integration  
**🗄️ Specialized tracking**: Elasticsearch, MongoDB, LLM, RabbitMQ  
**💉 DI Support**: Dependency injection with `@InjectApmService` decorator

## 🚀 Quick Start

```bash
# pnpm
pnpm add @nestlib/apm elastic-apm-node

# yarn
yarn add @nestlib/apm elastic-apm-node

# npm
npm i @nestlib/apm elastic-apm-node
```

```typescript
import { Module } from '@nestjs/common';
import { ApmModule } from '@nestlib/apm';

@Module({
  imports: [
    ApmModule.forRoot({
      active: true,
      config: {
        serviceName: 'my-service',
        serverUrl: 'http://apm-server:8200',
      },
    }),
  ],
})
export class AppModule {}
```

The module will automatically load APM configuration from `.env` file, environment variables, or provided options.

## ✨ Features

- 📊 **Elastic APM integration** for NestJS applications
- 🎯 **Automatic transaction tracking** with decorators
- 🔍 **Span tracking** for detailed performance monitoring
- 🗄️ **Specialized tracking** for Elasticsearch, MongoDB, LLM, and RabbitMQ
- 🎨 **Decorator-based API** for easy integration
- 🔌 **Interceptor support** for automatic HTTP request tracking
- ⚙️ **Flexible configuration** via module options, config files, or environment variables
- 🛡️ **Graceful degradation** when APM is disabled
- 📝 **Full TypeScript support** with type definitions
- 🔀 **Async module registration** with `forRootAsync`

## 📖 Usage

### Using ApmService

#### Inject and Access APM Service

```typescript
import { Injectable } from '@nestjs/common';
import { ApmService, InjectApmService } from '@nestlib/apm';

@Injectable()
export class MyService {
  constructor(
    @InjectApmService() private readonly apm: ApmService,
  ) {}

  async getUser(id: string) {
    return this.apm.runTransaction('getUser', 'request', async () => {
      // Your logic here
      return { id, name: 'John Doe' };
    });
  }
}
```

#### Transaction with Labels and Context

```typescript
async createOrder(userId: string, items: any[]) {
  return this.apm.runTransaction(
    'createOrder',
    'request',
    async () => {
      // Your order creation logic
      return { orderId: '12345' };
    },
    {
      labels: { userId, itemCount: items.length },
      context: { order: { items } },
    },
  );
}
```

#### Span Tracking

```typescript
async performDatabaseQuery() {
  return this.apm.runSpan(
    'database-query',
    'db',
    async () => {
      // Database query logic
    },
    {
      subtype: 'postgresql',
      labels: { 'db.name': 'mydb' },
    },
  );
}
```

### Using Decorators

#### @ApmTrack Decorator

Automatically track methods as transactions:

```typescript
import { Injectable } from '@nestjs/common';
import { ApmTrack } from '@nestlib/apm';

@Injectable()
export class DataService {
  @ApmTrack('fetchData', 'request')
  async fetchData() {
    // Your logic here
  }

  @ApmTrack() // Uses method name automatically
  async processData() {
    // Your logic here
  }
}
```

#### @ApmSpan Decorator

Track methods as spans within transactions:

```typescript
import { Injectable } from '@nestjs/common';
import { ApmSpan } from '@nestlib/apm';

@Injectable()
export class DatabaseService {
  @ApmSpan('database-query', 'db', 'postgresql')
  async queryDatabase() {
    // Database query logic
  }

  @ApmSpan() // Uses method name automatically
  async cacheLookup() {
    // Cache lookup logic
  }
}
```

### Specialized Tracking Methods

#### Elasticsearch

```typescript
async searchUsers(query: string) {
  return this.apm.trackElasticsearchQuery(
    'users-index',
    'search',
    async () => {
      return await elasticsearchClient.search({ ... });
    },
    { query },
  );
}
```

#### MongoDB

```typescript
async findUsers(filter: any) {
  return this.apm.trackMongoQuery(
    'users',
    'find',
    async () => {
      return await mongoCollection.find(filter).toArray();
    },
    filter,
  );
}
```

#### LLM Requests

```typescript
async generateText(prompt: string) {
  return this.apm.trackLlmRequest(
    'gpt-4',
    'completion',
    async () => {
      return await llmClient.complete(prompt);
    },
    { text: prompt, tokenCount: 100 },
  );
}
```

#### RabbitMQ Messages

```typescript
async handleMessage(queue: string, routingKey: string, data: any) {
  return this.apm.trackRabbitMqMessage(
    queue,
    routingKey,
    async (transaction) => {
      if (transaction) {
        transaction.addLabels({ messageId: data.id });
      }
      // Process message
    },
    data,
  );
}
```

### Async Configuration

Use `forRootAsync` when you need to load configuration dynamically:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApmModule } from '@nestlib/apm';

@Module({
  imports: [
    ApmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        active: config.get('APM_ACTIVE') === 'true',
        config: {
          serviceName: config.get('SERVICE_NAME'),
          environment: config.get('NODE_ENV'),
          serverUrl: config.get('APM_SERVER_URL'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using Interceptors

#### ElasticsearchApmInterceptor

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ElasticsearchApmInterceptor } from '@nestlib/apm';

@Controller('search')
@UseInterceptors(ElasticsearchApmInterceptor)
export class SearchController {
  @Get()
  async search() {
    // Elasticsearch query
  }
}
```

### Environment Variables

```env
# Enable/disable APM
ELASTIC_APM_ACTIVE=true

# Service identification
ELASTIC_APM_SERVICE_NAME=my-service
ELASTIC_APM_ENVIRONMENT=production

# APM Server connection
ELASTIC_APM_SERVER_URL=http://apm-server:8200
ELASTIC_APM_SECRET_TOKEN=your-secret-token
```

## 📚 API Reference

### ApmModule

#### `ApmModule.forRoot(options?: ApmModuleOptions)`

Initialize the APM module synchronously.

**Options:**

```typescript
interface ApmModuleOptions {
  config?: AgentConfigOptions; // Elastic APM configuration
  active?: boolean;            // Whether APM is active
  serviceName?: string;        // Service name
  environment?: string;        // Environment name
}
```

#### `ApmModule.forRootAsync(options?: ApmModuleAsyncOptions)`

Initialize the APM module asynchronously.

```typescript
interface ApmModuleAsyncOptions {
  imports?: any[];             // Modules to import
  inject?: InjectionToken[];   // Dependencies to inject into useFactory
  useFactory?: (...args: any[]) => Promise<ApmModuleOptions> | ApmModuleOptions;
}
```

### ApmService

Service for programmatic APM tracking.

```typescript
// Run a transaction
await apmService.runTransaction('name', 'type', fn, options?);

// Run a span within current transaction
await apmService.runSpan('name', 'type', fn, options?);

// Specialized tracking
await apmService.trackElasticsearchQuery(index, operation, fn, queryBody?);
await apmService.trackMongoQuery(collection, operation, fn, query?);
await apmService.trackLlmRequest(model, operation, fn, options?);
await apmService.trackRabbitMqMessage(queue, routingKey, fn, messageData?);

// Labels and context
apmService.addLabels({ key: 'value' });
apmService.setCustomContext({ custom: 'data' });

// Error tracking
apmService.captureError(error, context?);

// Check if APM is running
apmService.isStarted();
```

### InjectApmService

Decorator for injecting ApmService.

```typescript
// Inject default APM service
constructor(@InjectApmService() private apm: ApmService) {}

// Inject namespaced APM service
constructor(@InjectApmService('custom') private apm: ApmService) {}
```

### Decorators

#### @ApmTrack(name?, type?)

Decorator for automatic transaction tracking.

- `name` - Transaction name (optional, defaults to `ClassName.methodName`)
- `type` - Transaction type (default: `'custom'`)

#### @ApmSpan(name?, type?, subtype?)

Decorator for span tracking.

- `name` - Span name (optional, defaults to `ClassName.methodName`)
- `type` - Span type (default: `'custom'`)
- `subtype` - Span subtype (optional)

## 🔧 Configuration

### Configuration Priority

1. Module options (highest priority)
2. Config file (`.env` via `@lsk4/config`)
3. Environment variables (lowest priority)

### File Type Detection

The module automatically loads configuration from `.env` files:

```env
# .env
APM_ACTIVE=true
APM_SERVICE_NAME=my-service
APM_ENVIRONMENT=production
APM_SERVER_URL=http://apm-server:8200
```

### Graceful Degradation

If APM is not started or disabled, all methods work without tracking. Your application continues to function even if APM is unavailable.

## 📝 License

MIT © [Igor Suvorov](https://github.com/isuvorov)

## 🔗 Links

* [GitHub Repository](https://github.com/nestlibs/nestlib)
* [Issues](https://github.com/nestlibs/nestlib/issues)
* [Telegram](https://t.me/lskjschat)

---

**@nestlib/apm** – _Elastic APM integration for NestJS_ 📊
