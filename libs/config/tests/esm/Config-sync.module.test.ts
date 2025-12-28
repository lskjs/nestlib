import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { TestingModule } from '@nestjs/testing';
import {
  projectType,
  createSyncModule,
  type ConfigService,
  getConfigServiceToken,
} from './config.js';

const configImportType = 'sync';
const createModule = createSyncModule;

// NOTE: ниже копипаста для всех 4х файлов тестов

describe(`ConfigModule (${configImportType}) (${projectType} project)`, () => {
  describe(`${projectType} => ENV config`, () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await createModule('fixtures/env');
    });

    afterEach(async () => {
      await module.close();
    });

    it('should be defined', () => {
      assert.ok(module);
    });

    it('should provide ConfigService', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      assert.ok(configService);
    });

    it('should load config values', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      const common = configService.get('common');
      assert.strictEqual(common, 'Hello');
    });
  });

  describe(`${projectType} => ESM config`, () => {
    let module: TestingModule;
    if (projectType === 'ESM' && configImportType === 'sync') {
      it('ERR: SYNC IMPORT is not supported in ESM projects by Node.js', async () => {
        await assert.rejects(
          async () => {
            await createModule('fixtures/esm');
          },
          (error: Error) => {
            return (
              error instanceof Error &&
              (/sync import/i.test(error.message) ||
                /not supported in ESM/i.test(error.message) ||
                /ESM.*sync/i.test(error.message) ||
                /Dynamic require.*is not supported/i.test(error.message))
            );
          },
          'should throw error: sync import is not supported in ESM projects',
        );
      });
      return;
    }

    beforeEach(async () => {
      module = await createModule('fixtures/esm');
    });

    afterEach(async () => {
      await module.close();
    });

    it('should be defined', () => {
      assert.ok(module);
    });

    it('should provide ConfigService', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      assert.ok(configService);
    });

    it('should load config values', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      const common = configService.get('common');
      assert.strictEqual(common, 'Hello');
    });
  });

  describe(`${projectType} => CJS config`, () => {
    let module: TestingModule;
    if (projectType === 'ESM' && configImportType === 'sync') {
      it('ERR: SYNC IMPORT is not supported in ESM projects by Node.js', async () => {
        await assert.rejects(
          async () => {
            await createModule('fixtures/esm');
          },
          (error: Error) => {
            return (
              error instanceof Error && /Dynamic require.*is not supported/i.test(error.message)
            );
          },
          'should throw error: sync import is not supported in ESM projects',
        );
      });
      return;
    }

    beforeEach(async () => {
      module = await createModule('fixtures/cjs');
    });

    afterEach(async () => {
      await module.close();
    });

    it('should be defined', () => {
      assert.ok(module);
    });

    it('should provide ConfigService', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      assert.ok(configService);
    });

    it('should load config values', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      const common = configService.get('common');
      assert.strictEqual(common, 'Hello');
    });
  });

  describe(`${projectType} => TS config`, () => {
    let module: TestingModule;
    if (projectType === 'ESM' && configImportType === 'sync') {
      it('ERR: SYNC IMPORT is not supported in ESM projects by Node.js', async () => {
        await assert.rejects(
          async () => {
            await createModule('fixtures/esm');
          },
          (error: Error) => {
            return (
              error instanceof Error &&
              (/sync import/i.test(error.message) ||
                /not supported in ESM/i.test(error.message) ||
                /ESM.*sync/i.test(error.message) ||
                /Dynamic require.*is not supported/i.test(error.message))
            );
          },
          'should throw error: sync import is not supported in ESM projects',
        );
      });
      return;
    }

    beforeEach(async () => {
      module = await createModule('fixtures/ts');
    });

    afterEach(async () => {
      await module.close();
    });

    it('should be defined', () => {
      assert.ok(module);
    });

    it('should provide ConfigService', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      assert.ok(configService);
    });

    it('should load config values', () => {
      const configService = module.get<ConfigService>(getConfigServiceToken());
      const common = configService.get('common');
      assert.strictEqual(common, 'Hello');
    });
  });

  describe(`${projectType} => Missing config`, () => {
    it('should throw error when config is missing and throwError is not specified', async () => {
      await assert.rejects(
        async () => {
          await createModule('fixtures', { name: 'nonexistent.config' });
        },
        (error: Error) => {
          return error instanceof Error;
        },
        'should throw error when config file is missing',
      );
    });

    it('should not throw error when config is missing and throwError is false', async () => {
      const module = await createModule('fixtures', {
        name: 'nonexistent.config',
        throwError: false,
      });

      assert.ok(module);
      const configService = module.get<ConfigService>(getConfigServiceToken());
      assert.ok(configService);

      await module.close();
    });
  });
});
