import { DynamicModule, Module } from '@nestjs/common';

import { CryptoService } from './CryptoService';

@Module({
  // import: [],
  // controllers: [AuthController],
  // providers: [CryptoService, AuthOtpService, AuthService],
  // exports: [CryptoService, AuthOtpService, AuthService],
})
export class CryptoModule {
  static forRoot(): DynamicModule {
    return {
      module: CryptoModule,
      providers: [CryptoService],
      exports: [CryptoService],
    };
  }
}
