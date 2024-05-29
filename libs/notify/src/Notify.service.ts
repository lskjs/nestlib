import type { RlogSendData, RlogSendOptions } from '@lsk4/rlog';
import { Rlog } from '@lsk4/rlog';
import { Inject, Injectable } from '@nestjs/common';

import { NOTIFY_MODULE_OPTIONS_TOKEN } from './tokens.js';
import { NotifyModuleOptions } from './types.js';

@Injectable()
export class NotifyService {
  private client: Rlog;
  constructor(@Inject(NOTIFY_MODULE_OPTIONS_TOKEN) private readonly options: NotifyModuleOptions) {
    this.client = new Rlog(this.options);
  }
  send(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.send(data, options);
  }
  trace(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.trace(data, options);
  }
  debug(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.debug(data, options);
  }
  info(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.info(data, options);
  }
  warn(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.warn(data, options);
  }
  error(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.error(data, options);
  }
  fatal(data: RlogSendData, options: RlogSendOptions = {}) {
    return this.client.fatal(data, options);
  }
}
