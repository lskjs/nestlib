import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}
  get(key: string) {
    const res = this.configService.get(key);
    // console.log('ConfigService.get', { key }, res);
    // console.log('configService', this.configService);
    return res;
  }
}

export default ConfigService;
