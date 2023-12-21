import { createLogger } from '@lsk4/log';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CryptoService implements OnModuleInit {
  client: any;
  // TODO: move to config
  saltLength = 16;
  defaultSalt?: string;

  log = createLogger(this.constructor.name);
  async onModuleInit() {
    this.client = await this.createClient();
    this.defaultSalt = await this.generateSalt(this.saltLength);
  }
  async createClient() {
    try {
      return await import('./utils/bcrypt.js');
    } catch (err) {
      this.log.trace('bcrypt not found, try using bcryptjs');
    }
    try {
      return await import('./utils/bcryptjs.js');
    } catch (err) {
      this.log.trace('bcryptjs not found, try using crypto');
    }
    try {
      return await import('./utils/crypto.js');
    } catch (err) {
      this.log.trace('crypto not found, fatal');
      throw err;
    }
    return null;
  }
  async generateSalt(initLength?: number) {
    const length = initLength || this.saltLength;
    const salt = await this.client.generateSalt(length);
    return salt;
  }
  async hashPassword(password: string, initSalt?: string): Promise<string> {
    const salt = initSalt || this.defaultSalt;
    const hash = await this.client.hashPassword(password, salt);
    return hash;
  }
  async comparePassword(inputPassword: string, passwordHash: string): Promise<boolean> {
    const isMatch = await this.client.comparePassword(inputPassword, passwordHash);
    return isMatch;
  }
}
