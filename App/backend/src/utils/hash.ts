import bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password The plain text password
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param hash The hashed password
 * @returns True if the password matches the hash, false otherwise
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
