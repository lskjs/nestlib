// eslint-disable-next-line no-promise-executor-return
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const inc = (obj: Record<string, any>, key: string, val = 1) => {
  // eslint-disable-next-line no-param-reassign
  obj[key] = (obj[key] || 0) + val;
  return obj[key];
};
