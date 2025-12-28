import { Inject, Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { log } from './log';

@Injectable()
export class ConfigService {
  log = log;
  constructor(@Inject(NestConfigService) private configService: NestConfigService) {}
  get(key: string) {
    const res = this.configService.get(key);
    this.log.trace('get', key, res);
    return res;
  }
}

export default ConfigService;
