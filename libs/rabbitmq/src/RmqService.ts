import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createLogger } from '@lsk4/log';
import { Injectable } from '@nestjs/common';

import { RmqRequestPayload } from './types';

@Injectable()
export class RmqService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: string, routingKey: string, payload: RmqRequestPayload) {
    const { pattern, ...other } = payload || {};
    const ns = ['rmq:publish', exchange, routingKey].filter(Boolean).join(':');
    // TODO: add cache
    const log = createLogger(ns);
    log.trace(`[${pattern}]`, other);
    const time = Date.now();
    const res = await this.amqpConnection.publish(exchange, routingKey, payload);
    const ms = Date.now() - time;
    log.debug(`[${pattern}]`, other, res || 'OK', `${ms}ms`);
    return res;
  }
  async request(raw: {
    exchange: string;
    routingKey: string;
    timeout: number;
    payload: RmqRequestPayload;
  }) {
    const { exchange, routingKey, payload } = raw || {};
    const { pattern, ...other } = payload || {};
    const ns = ['rmq:request', exchange, routingKey].filter(Boolean).join(':');
    // TODO: add cache
    const log = createLogger(ns);
    log.trace(`[${pattern}]`, other);
    const time = Date.now();
    const res = await this.amqpConnection.request(raw);
    const ms = Date.now() - time;
    log.debug(`[${pattern}]`, other, res || 'OK', `${ms}ms`);
    return res;
  }
}
