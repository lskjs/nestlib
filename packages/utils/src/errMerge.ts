import { errProps } from './errProps';

export const errMerge = (...args: any[]): object => {
  const [params1, params2] = args;
  let params = {};
  if (typeof params1 === 'string') {
    params.code = params1;
    if (typeof params2 === 'string') {
      params.message = params2;
    }
  }
  args.forEach((p) => {
    params = {
      ...params,
      ...errProps(p),
    };
  });
  return params;
}

export default errMerge;