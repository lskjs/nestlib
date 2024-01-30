import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createLogger } from '@lsk4/log';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: string, routingKey: string, data: any) {
    const ns = ['rmq', exchange, routingKey].filter(Boolean).join(':');
    // TODO: add cache
    const log = createLogger(ns);
    log.trace('publish', data);
    const time = Date.now();
    const res = await this.amqpConnection.publish(exchange, routingKey, data);
    const ms = Date.now() - time;
    log.debug('publish', data, res || 'OK', { ms });
    return res;
  }
  async request(raw: { exchange: string; routingKey: string; timeout: number; payload: any }) {
    const { exchange, routingKey } = raw;
    const ns = ['rmq', exchange, routingKey].filter(Boolean).join(':');
    // TODO: add cache
    const log = createLogger(ns);
    log.trace('request', raw);
    const time = Date.now();
    const res = await this.amqpConnection.request(raw);
    const ms = Date.now() - time;
    log.debug('request', raw, res || 'OK', { ms });
    return res;
  }
}
