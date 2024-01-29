import { Inject } from '@nestjs/common';

import { getRedisServiceToken } from './tokens.js';

export const InjectRedisService = (connection?: string) => Inject(getRedisServiceToken(connection));
