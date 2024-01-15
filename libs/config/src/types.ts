export type PropsFn = (res: Record<string, unknown>) => Record<string, unknown>;

export interface ConfigModuleOptions {
  connection?: string;

  name?: string;
  cwd?: string;
  files?: string[];
  exts?: string[];
  stopDir?: string;
  throwError?: boolean;
  silent?: boolean;
  packageKey?: string;
  processEnvKey?: string;
}
