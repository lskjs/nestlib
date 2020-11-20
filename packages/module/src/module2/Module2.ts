/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Logger, ILogger } from '@lskjs/log2';
import Emitter from './emitter';
import assignProps from '@lskjs/utils/assignProps';
import { IEventEmitter, IModule, IApp} from './types';

class Module2 implements IModule {
  name: string;
  _module?: boolean | string;
  app?: IApp;
  parent?: IModule;
  ee?: IEventEmitter;
  log?: ILogger;
  config: {
    log?: any;
    [key: string]: any;
  };

  constructor(...props: any[]) {
    assignProps(this, ...props);
  }

  createLogger(): ILogger {
    const logProps = this.config.log || {};
    return new Logger({ ...logProps, name: this.name });
  }

  createEventEmitter(): IEventEmitter {
    return Emitter();
  }

  on(event: string, callback: (event: string, ...args: any[]) => void): void {
    if (!this.ee) this.ee = this.createEventEmitter();
    this.ee.on(event, callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.ee) this.ee = this.createEventEmitter();
    this.ee.emit(event, ...args);
  }

  private __initAt: Date;
  private __runAt: Date;

  async init(): Promise<void> {
    if (this.__initAt) return;
    this.__initAt = new Date();
    this.name = this.constructor.name;
    if (!this.log) this.log = this.createLogger();
    this.log.trace('init');
  }

  async run(): Promise<void> {
    if (this.__runAt) return;
    if (!this.__initAt) await this.init();
    this.__runAt = new Date();
    this.log.trace('run');
  }

  async start(): Promise<void> {
    if (!this.__initAt) await this.init();
    if (!this.__runAt) await this.run();
  }
}

export default Module2;
