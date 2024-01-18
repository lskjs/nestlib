import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createLogger } from '@lsk4/log';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RmqService {
  log = createLogger('rmq');
  // constructor() {}
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: string, routingKey: string, data: any) {
    this.log.trace('[publish]', { exchange, routingKey, data });
    const res = await this.amqpConnection.publish(exchange, routingKey, data);
    this.log.debug('[publish]', { exchange, routingKey, data }, res);
    return res;
  }
  async request(raw: { exchange: string; routingKey: string; timeout: number; payload: any }) {
    this.log.trace('[request]', raw);
    const res = await this.amqpConnection.request(raw);
    this.log.debug('[request]', raw, res);
    return res;
  }
}
