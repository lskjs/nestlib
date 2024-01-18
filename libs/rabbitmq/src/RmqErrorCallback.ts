import { omitNull } from '@lsk4/algos';
import { Err } from '@lsk4/err';

import { getRmqConfig } from './config';
import { log } from './log';
import { RmqChannel, RmqConsumeMessage } from './types';

export function RmqErrorCallback(channel: RmqChannel, msg: RmqConsumeMessage, err: any) {
  const isLog = getRmqConfig('isLog') || false;
  if (isLog) log.error('[RmqErrorCallback]', err);
  // console.log('msg', msg);
  const { replyTo, correlationId } = msg.properties;
  if (err?.status === 300 || (err?.__err && err?.rd)) {
    const { routingKey, exchange } = msg.fields;
    const rd = typeof err?.rd === 'string' ? err?.rd : `${routingKey}_rd`;
    const { pattern, data, ...meta } = err.meta || {};
    const payload = omitNull({
      pattern,
      data,
      err: Err.getJSON(err) || Err.getCode(err),
      meta: {
        ...meta,
        exchange,
        routingKey,
      },
    });
    channel.publish('', rd, Buffer.from(JSON.stringify(payload)));
  }
  if (replyTo) {
    let error;
    if (err?.__err) {
      error = JSON.stringify(err);
    } else if ((err instanceof Error) as any) {
      error = JSON.stringify({
        code: err?.code || err?.name || 1,
        message: err?.message,
      });
    } else if (typeof err === 'string') {
      error = JSON.stringify({
        code: 1,
        message: err,
      });
    } else {
      error = JSON.stringify(err);
    }
    channel.publish('', replyTo, Buffer.from(error), { correlationId });
  }
  if (err?.status === 200 || err?.status === 300) {
    channel.nack(msg, false, false);
  } else {
    channel.nack(msg, false, true);
  }
}
