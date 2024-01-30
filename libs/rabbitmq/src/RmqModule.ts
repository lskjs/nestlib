import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule, Module } from '@nestjs/common';

import { RmqService } from './RmqService';
import { getRmqServiceToken } from './tokens';

@Module({})
export class RmqModule {
  static forRoot(options: any = {}): DynamicModule {
    // log.trace('[forRoot]', options);
    const RmqService2 = {
      provide: getRmqServiceToken(options.connection),
      useExisting: RmqService,
    };
    return {
      imports: [RabbitMQModule.forRoot(RabbitMQModule, options)],
      module: RmqModule,
      providers: [RmqService, RmqService2],
      exports: [RmqService, RmqService2],
    };
  }
  static forRootAsync(options: any = {}): DynamicModule {
    // log.trace('[forRootAsync]', options);
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
