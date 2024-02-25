import type { LskModuleOptions } from './types';

export const startLskModule = async (options: LskModuleOptions) => {
  // TODO: подумать а нужно ли омитить NS ?

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ns, module: Module, ...other } = options;
  return Module.start(other);
};
