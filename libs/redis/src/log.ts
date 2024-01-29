import { createLogger } from '@lsk4/log';

export const log = createLogger({ ns: 'redis' }, { level: 'debug' });
