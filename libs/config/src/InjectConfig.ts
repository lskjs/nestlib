import { Inject } from '@nestjs/common';

import { getConfigServiceToken } from './tokens.js';

export const InjectConfig = (connection?: string) => Inject(getConfigServiceToken(connection));
