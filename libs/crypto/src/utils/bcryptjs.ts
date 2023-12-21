import bcryptjs from 'bcryptjs';

export const generateSalt = async (length = 16): Promise<string> =>
  new Promise((resolve, reject) => {
    bcryptjs.genSalt(length, (err, salt) => {
      if (err) return reject(err);
      return resolve(salt);
    });
  });
// export const defaultSalt = generateSalt();

export async function hashPassword(password: string, initSalt?: string): Promise<string> {
  const salt = initSalt || (await generateSalt());
  return new Promise((resolve, reject) => {
    bcryptjs.hash(password, salt, (err, hash) => {
      if (err) return reject(err);
      return resolve(hash);
    });
  });
}

export async function comparePassword(
  inputPassword: string,
  hashedPassword: string,
  // salt = defaultSalt,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcryptjs.compare(inputPassword, hashedPassword, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}
