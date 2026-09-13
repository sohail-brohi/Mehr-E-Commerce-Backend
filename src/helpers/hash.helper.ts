import { createHash } from "crypto";
import bcrypt from "bcryptjs";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
