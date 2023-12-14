import { isDev } from '@lsk4/env';
import { Err } from '@lsk4/err';
import { createLogger } from '@lsk4/log';

import { pe } from './pe';

const isDebug = isDev;
const defaultLevel = isDebug ? 'debug' : 'error';
const log = createLogger('web', { level: defaultLevel });

// TODO: вынести в отдельный компонент
export const printPrettyError = (error: any) => {
  if (error instanceof Error) {
    const errCode = Err.getCode(error);
    const errMessage = errCode !== Err.getMessage(error) ? Err.getMessage(error) : '';
    log.warn([errCode, errMessage].filter(Boolean).join(': '));
    if (log.level === 'trace' || log.level === 'debug') {
      // eslint-disable-next-line no-console
      console.log(pe.render(error));
    }
    log.trace('err:', error);
  } else {
    log.warn('err:', error);
  }
};
