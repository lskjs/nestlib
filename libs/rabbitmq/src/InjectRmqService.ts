import { Inject } from '@nestjs/common';

import { getRmqServiceToken } from './tokens';

export const InjectRmqService = (connection?: string) => Inject(getRmqServiceToken(connection));
