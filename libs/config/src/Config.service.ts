import { createLogger } from '@lsk4/log';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  log = createLogger(`nestlib:config`, { level: 'debug' });
  constructor(private configService: NestConfigService) {}
  get(key: string) {
    const res = this.configService.get(key);
    this.log.trace('get', key, res);
    return res;
  }
}

export default ConfigService;
