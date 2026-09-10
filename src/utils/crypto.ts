/**
 * Cryptographic & Unique Identifier Utilities
 * Native Web Crypto API SHA-256 password hashing and random slug generators.
 */

const SALT = '_lab_salt_2026';

/**
 * Hashes a plaintext password using native Web Crypto SHA-256.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a clean nano slug (e.g. "qr-9a8f2k").
 */
export function generateSlug(prefix = 'qr-', length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
