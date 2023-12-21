import crypto from 'node:crypto';

export const generateSalt = (length = 16) => crypto.randomBytes(length).toString('hex');
export const defaultSalt = generateSalt();

export function hashPassword(password: string, salt = defaultSalt): Promise<string> {
  // const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  // return hash.toString('hex');
  return new Promise((resolve, reject) => {
    const iterations = 10000;
    const keyLength = 64;
    const digest = 'sha512';

    crypto.pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
      if (err) reject(err);
      else {
        const mcf = `$pbkdf2-sha512$${iterations}$${salt}$${derivedKey.toString('base64')}`;
        resolve(mcf);
      }
    });
  });
}

export async function comparePassword(
  inputPassword: string,
  hashedPassword: string,
  salt = defaultSalt,
) {
  const inputHash = await hashPassword(inputPassword, salt);
  return inputHash === hashedPassword;
}
