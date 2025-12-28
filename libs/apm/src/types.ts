import type { AgentConfigOptions } from 'elastic-apm-node';

export interface ApmModuleOptions {
  /**
   * APM configuration options
   * If not provided, will try to load from config.apm or environment variables
   */
  config?: AgentConfigOptions;

  /**
   * Whether APM is active
   * Can be overridden by ELASTIC_APM_ACTIVE environment variable
   */
  active?: boolean;

  /**
   * Service name
   * Can be overridden by ELASTIC_APM_SERVICE_NAME environment variable
   */
  serviceName?: string;

  /**
   * Environment name
   * Can be overridden by ELASTIC_APM_ENVIRONMENT environment variable
   */
  environment?: string;
}

export interface ApmTransactionOptions {
  labels?: Record<string, string | number | boolean>;
  context?: Record<string, any>;
}

export interface ApmSpanOptions {
  subtype?: string;
  labels?: Record<string, string | number | boolean>;
  context?: Record<string, any>;
}

export interface ApmElasticsearchOptions {
  index: string;
  operation: string;
  queryBody?: any;
}

export interface ApmMongoOptions {
  collection: string;
  operation: string;
  query?: any;
}

export interface ApmLlmOptions {
  model: string;
  operation: string;
  text?: string;
  tokenCount?: number;
}

export interface ApmRabbitMqOptions {
  queue: string;
  routingKey: string;
  messageData?: any;
}

