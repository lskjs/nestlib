import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';

// import { ConfigModule } from '@nestlib/config';
import { ConfigService } from './ConfigService';
import { loadConfigEnvs } from './loadConfigEnvs';
import { ConfigModuleOptions } from './types';
import { getConfigServiceToken } from './utils';

@Global()
@Module({
  // import: [],
  // controllers: [AuthController],
  // providers: [CryptoService, AuthOtpService, AuthService],
  // exports: [ConfigService],
  // exports: [
  //   // ConfigService,
  //   // NestConfigService,
  //   {
  //     provide: getConfigServiceToken(),
  //     useExisting: ConfigService,
  //   },
  // ],
})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    const rootDir = options.cwd || process.cwd();
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

    const ConfigService2 = {
      provide: getConfigServiceToken(options.connection),
      useExisting: ConfigService,
    };
    return {
      imports: [
        NestConfigModule.forRoot({ envFilePath: envFiles }),
        NestConfigModule.forRoot(loadConfigEnvs(['process.env.ENV_JSON', ...configEnvs])),
        // ConfigModule.forRoot(loadConfigEnvs(['process.env.ENV_JSON', ...configEnvs])),
      ],
      module: ConfigModule,
      // controllers: [AuthController],
      providers: [ConfigService, NestConfigService, ConfigService2],
      exports: [ConfigService, NestConfigService, ConfigService2],
    };
  }
  static getExports() {
    return [
      ConfigService,
      NestConfigService,
      {
        provide: getConfigServiceToken(),
        useExisting: ConfigService,
      },
    ];
  }
}
