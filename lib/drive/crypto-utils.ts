/**
 * Cryptographic Utilities for Secure Share Links
 * Uses standard Web Crypto API (supported in Node 18+ and all modern browsers)
 */

export function generateShareToken(length: number = 24): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const array = new Uint8Array(length);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  let result = 'sh_';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function generateSalt(length: number = 16): string {
  const chars = 'abcdef0123456789';
  const array = new Uint8Array(length);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 16);
    }
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPasswordHash(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPasswordWithSalt(password, salt);
  return computed === expectedHash;
}
