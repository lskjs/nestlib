import { Inject } from '@nestjs/common';

import { getApmServiceToken } from './tokens.js';

export const InjectApmService = (ns?: string) => Inject(getApmServiceToken(ns));



