import { Inject } from '@nestjs/common';

import { getLskModuleToken } from './tokens.js';

export const InjectLskModule = (ns?: string) => Inject(getLskModuleToken(ns));
