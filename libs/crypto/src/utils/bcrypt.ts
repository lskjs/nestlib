// import bcrypt from 'bcrypt';

// export const generateSalt = async (length = 16): Promise<string> => {
//   const salt = await bcrypt.genSalt(length);
//   return salt;
// };
// export const defaultSalt = generateSalt();

// export async function hashPassword(password: string, initSalt?: string): Promise<string> {
//   const salt = initSalt || (await defaultSalt);
//   const hash = await bcrypt.hash(password, salt);
//   return hash;
// }

// export async function comparePassword(
//   inputPassword: string,
//   hashedPassword: string,
//   // salt = defaultSalt,
// ): Promise<boolean> {
//   const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
//   return isMatch;
// }

// NOTE: not working with ESM esbuild
throw '!bcrypt';
