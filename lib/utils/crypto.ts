const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // bytes
const HASH_ALGORITHM = "SHA-256";

export interface PinHashRecord {
  algorithm: "PBKDF2";
  iterations: number;
  salt: string;
  hash: string;
  keyLength: number;
}

const getCrypto = (): Crypto => {
  if (typeof globalThis.crypto === "undefined") {
    throw new Error("Web Crypto API is not available in the current environment");
  }

  return globalThis.crypto;
};

const uint8ArrayToBinary = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  if (typeof btoa === "function") {
    return btoa(uint8ArrayToBinary(bytes));
  }

  return Buffer.from(bytes).toString("base64");
};

const base64ToBytes = (value: string): Uint8Array => {
  if (typeof atob === "function") {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  const buffer = Buffer.from(value, "base64");
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
};

export const generateSalt = (length = 16): string => {
  const crypto = getCrypto();
  const saltBytes = new Uint8Array(length);
  crypto.getRandomValues(saltBytes);
  return bytesToBase64(saltBytes);
};

const deriveKey = async (pin: string, saltBytes: Uint8Array): Promise<Uint8Array> => {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const encodedPin = encoder.encode(pin);

  const keyMaterial = await crypto.subtle.importKey("raw", encodedPin, { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: HASH_ALGORITHM,
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
};

export const hashPin = async (pin: string, salt?: string): Promise<PinHashRecord> => {
  const saltValue = salt ?? generateSalt();
  const saltBytes = base64ToBytes(saltValue);
  const derived = await deriveKey(pin, saltBytes);

  return {
    algorithm: "PBKDF2",
    iterations: PBKDF2_ITERATIONS,
    salt: saltValue,
    hash: bytesToBase64(derived),
    keyLength: KEY_LENGTH,
  };
};

export const verifyPin = async (pin: string, record: PinHashRecord): Promise<boolean> => {
  const saltBytes = base64ToBytes(record.salt);
  const derived = await deriveKey(pin, saltBytes);
  const expected = base64ToBytes(record.hash);

  return timingSafeEqual(derived, expected);
};
