import type { LoadConfigOptions } from '@lsk4/config';

export type PropsFn = (res: Record<string, unknown>) => Record<string, unknown>;

type Fn = (a: any) => any;
export interface ConfigModuleOptions extends LoadConfigOptions {
  ns?: string;
  key?: string | Fn;

  name?: string;
}
