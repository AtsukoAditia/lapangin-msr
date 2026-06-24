import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch {
    return false;
  }
}
