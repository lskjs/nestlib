import type { LoadConfigOptions } from '@lsk4/config';

export type PropsFn = (res: Record<string, unknown>) => Record<string, unknown>;

export interface ConfigModuleOptions extends LoadConfigOptions {
  ns?: string;
  key?: string | PropsFn;

  name?: string;
}
