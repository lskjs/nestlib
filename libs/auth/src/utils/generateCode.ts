import { Err } from '@lsk4/err';
// import { customAlphabet, urlAlphabet } from 'nanoid';

// NOTE: because nanoid cjs module is not working
export function generateCode({
  type = 'hex',
  length = 10,
}: { type?: string; length?: number } = {}) {
  let alphabet = '';

  if (type === 'number') {
    alphabet = '1234567890';
  } else if (type === 'hex') {
    alphabet = '1234567890abcdef';
  } else if (type === 'url') {
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  } else {
    throw new Err('NOT_IMPLEMENTED');
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}

// export function generateCode({
//   type = 'hex',
//   length = 10,
// }: { type?: string; length?: number } = {}) {
//   if (type === 'number') {
//     return customAlphabet('1234567890', length)();
//   }
//   if (type === 'hex') {
//     return customAlphabet('1234567890abcdef', length)();
//   }
//   if (type === 'url') {
//     return customAlphabet(urlAlphabet, length)();
//   }
//   throw new Err('NOT_IMPLEMENTED');
// }

// async generateUniqCode(params, iteration = 0) {
//     const PermitModel = await this.app.module('models.PermitModel');
//     // throw new Err('!code');
//     // if (iteration) {
//     //   str2 += Math.floor(Math.random() * 100000);
//     // }
//     if (iteration > 10) throw new Err('cant create uniq code');
//     const code = this.generateCode(params);
//     // ...criteria
//     const permit = await PermitModel.findOne({ code }).select('_id');
//     if (permit) return this.generateUniqCode(params, iteration + 1);
//     return code;
//   }
