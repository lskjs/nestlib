import { DynamicModule, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';

// import { ConfigModule } from '@nestlib/config';
import { ConfigService } from './ConfigService';
import { loadConfigEnvs } from './loadConfigEnvs';

@Module({
  // import: [],
  // controllers: [AuthController],
  // providers: [CryptoService, AuthOtpService, AuthService],
  // exports: [ConfigService],
})
export class ConfigModule {
  static forRoot(): DynamicModule {
    const rootDir = process.cwd();
    const envFiles = ['.env', '../.env', '../../.env'].map((f) => `${rootDir}/${f}`);
    const configEnvs = [
      '.env.js',
      '.env.json',
      '../.env.js',
      '../.env.json',
      '../../.env.js',
      '../../.env.json',
    ].map((f) => `${rootDir}/${f}`);
    // console.log('[CnfModule]', { envFiles, configEnvs });
    return {
      imports: [
        NestConfigModule.forRoot({ envFilePath: envFiles }),
        NestConfigModule.forRoot(loadConfigEnvs(['process.env.ENV_JSON', ...configEnvs])),
        // ConfigModule.forRoot(loadConfigEnvs(['process.env.ENV_JSON', ...configEnvs])),
      ],
      module: ConfigModule,
      // controllers: [AuthController],
      providers: [ConfigService, NestConfigService],
      exports: [ConfigService, NestConfigService],
    };
  }
  static getExports() {
    return [ConfigService, NestConfigService];
  }
}
