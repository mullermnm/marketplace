import { customAlphabet } from "nanoid";

const alphanum = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  16,
);
export const newId = (prefix: string) => `${prefix}_${alphanum()}`;

const upper = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);
export function newLicenseKey() {
  return [upper(), upper(), upper(), upper(), upper()].join("-");
}

const tokenAlpha = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
  48,
);
export const newToken = () => tokenAlpha();

const affAlpha = customAlphabet(
  "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789",
  10,
);
export const newAffiliateId = () => affAlpha();
