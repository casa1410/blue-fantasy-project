import { randomBytes } from "node:crypto";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function generateTempPassword(length = 14): string {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}
