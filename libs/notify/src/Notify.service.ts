import type { RlogSendData } from '@lsk4/rlog';
import { Rlog } from '@lsk4/rlog';
import { Inject, Injectable } from '@nestjs/common';

import { NOTIFY_MODULE_OPTIONS_TOKEN } from './tokens.js';
import type { NotifyModuleOptions, NotifySendOptions } from './types.js';

@Injectable()
export class NotifyService {
  private client: Rlog;
  constructor(@Inject(NOTIFY_MODULE_OPTIONS_TOKEN) private readonly options: NotifyModuleOptions) {
    this.client = new Rlog(this.options);
  }
  async send(props: RlogSendData, options: NotifySendOptions = {}) {
    const { data } = await this.client.send(props, options);
    return data;
  }
  trace(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.trace(data, options);
  }
  debug(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.debug(data, options);
  }
  info(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.info(data, options);
  }
  warn(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.warn(data, options);
  }
  error(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.error(data, options);
  }
  fatal(data: RlogSendData, options: NotifySendOptions = {}) {
    return this.client.fatal(data, options);
  }
}
