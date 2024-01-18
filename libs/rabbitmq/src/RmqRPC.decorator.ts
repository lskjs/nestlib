import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { applyDecorators } from '@nestjs/common';

import { getRmqConfig } from './config';
import { log } from './log';
import { RmqRPCConfigProps } from './types';

export function RmqRPC(props: RmqRPCConfigProps) {
  const { channel } = props?.queueOptions || {};
  const channelConfig = getRmqConfig(`channels.${channel}`);
  const prefetchCount = props?.prefetchCount || channelConfig?.prefetchCount || undefined;
  const decorators = [];
  const message = `RmqRPC ${channel}=${prefetchCount} ${props.routingKey || ''}`;
  // log.trace('[[RmqRPC]]', props, RmqRPCConfig);
  if (prefetchCount) {
    log.debug(message);
    decorators.push(RabbitRPC(props));
  } else {
    log.trace(message);
  }
  return applyDecorators(...decorators);
}
