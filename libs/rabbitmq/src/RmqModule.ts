import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { createLogger } from '@lsk4/log';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { RmqService } from './RmqService';
import { getRmqServiceToken } from './tokens';

const log = createLogger('rmq');

@Global()
@Module({})
export class RmqModule {
  // static forRootAsync(asyncConfig: any = {}): DynamicModule {
  static forRoot(options: any = {}): DynamicModule {
    log.trace('[forRoot]', options);
    // console.log({ asyncConfig });

    const RmqService2 = {
      provide: getRmqServiceToken(options.connection),
      useExisting: RmqService,
    };
    return {
      imports: [RabbitMQModule.forRootAsync(RabbitMQModule, options)],
      module: RmqModule,
      providers: [RmqService, RmqService2],
      exports: [RmqService, RmqService2],
    };
  }
}
