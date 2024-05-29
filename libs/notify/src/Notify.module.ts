import { DynamicModule, Module } from '@nestjs/common';

import { NotifyService } from './Notify.service.js';
import { NOTIFY_MODULE_OPTIONS_TOKEN } from './tokens.js';
import type { NotifyModuleOptions } from './types.js';

@Module({
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {
  static forRoot(options: NotifyModuleOptions): DynamicModule {
    return {
      module: NotifyModule,
      providers: [
        {
          provide: NOTIFY_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
        NotifyService,
      ],
      exports: [NotifyService],
    };
  }
}
