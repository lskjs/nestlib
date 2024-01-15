import { Inject } from '@nestjs/common';

import { getConfigServiceToken } from './utils';

export const InjectConfig = (connection?: string) => Inject(getConfigServiceToken(connection));
