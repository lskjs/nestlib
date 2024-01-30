import type { RabbitHandlerConfig } from '@golevelup/nestjs-rabbitmq';
import * as amqplib from 'amqplib';

export type RmqChannel = amqplib.Channel;
export type RmqConsumeMessage = amqplib.ConsumeMessage;

// import { RabbitHandlerConfig } from '@golevelup/nestjs-rabbitmq';

export type RmqRPCConfigProps = Pick<
  RabbitHandlerConfig,
  | 'queue'
  | 'name'
  | 'connection'
  | 'exchange'
  | 'routingKey'
  | 'createQueueIfNotExists'
  | 'assertQueueErrorHandler'
  | 'queueOptions'
  | 'errorBehavior'
  | 'errorHandler'
  | 'allowNonJsonMessages'
> & { prefetchCount?: number };

export type RmqRequestPayload = {
  pattern: string;
  data: any;
};
