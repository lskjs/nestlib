import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Test } from '@nestjs/testing';
import { ConfigModule } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createAsyncModule(
  path: string,
  options?: { name?: string; throwError?: boolean },
) {
  const cwd = join(__dirname, path);
  return await Test.createTestingModule({
    imports: [
      ConfigModule.forRootAsync({
        useFactory: () => ({
          name: options?.name ?? 'env.config',
          cwd,
          throwError: options?.throwError,
        }),
      }),
    ],
  }).compile();
}
export async function createSyncModule(
  path: string,
  options?: { name?: string; throwError?: boolean },
) {
  const cwd = join(__dirname, path);
  return await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        name: options?.name ?? 'env.config',
        cwd,
        throwError: options?.throwError,
      }),
    ],
  }).compile();
}
