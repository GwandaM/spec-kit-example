import { StorageError, type StorageAdapter } from "./adapter";

export interface LocalStorageAdapterOptions {
  storage?: Storage;
  namespace?: string;
}

const QUOTA_ERROR_NAMES = new Set(["QuotaExceededError", "NS_ERROR_DOM_QUOTA_REACHED"]);

const isQuotaError = (error: unknown): boolean => {
  return error instanceof Error && QUOTA_ERROR_NAMES.has(error.name);
};

export class LocalStorageAdapter implements StorageAdapter {
  private readonly storage: Storage;
  private readonly namespacePrefix: string;

  constructor(options: LocalStorageAdapterOptions = {}) {
    const storage = options.storage ?? globalThis.localStorage;

    if (!storage) {
      throw new StorageError("LocalStorage is not available in this environment", "UNKNOWN");
    }

    this.storage = storage;
    this.namespacePrefix = options.namespace ? `${options.namespace}:` : "";
  }

  private withNamespace(key: string): string {
    return `${this.namespacePrefix}${key}`;
  }

  private stripNamespace(key: string): string {
    if (!this.namespacePrefix) {
      return key;
    }

    return key.startsWith(this.namespacePrefix) ? key.slice(this.namespacePrefix.length) : key;
  }

  private serialize(key: string, value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw new StorageError(
        `Failed to serialize value for key ${key}: ${(error as Error).message}`,
        "SERIALIZATION_ERROR"
      );
    }
  }

  private deserialize<T>(key: string, value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new StorageError(
        `Failed to parse stored value for key ${key}: ${(error as Error).message}`,
        "SERIALIZATION_ERROR"
      );
    }
  }

  private listNamespacedKeys(): string[] {
    const keys: string[] = [];

    for (let index = 0; index < this.storage.length; index += 1) {
      const rawKey = this.storage.key(index);
      if (!rawKey) {
        continue;
      }

      if (!this.namespacePrefix || rawKey.startsWith(this.namespacePrefix)) {
        keys.push(rawKey);
      }
    }

    return keys;
  }

  async get<T>(key: string): Promise<T | null> {
    const namespacedKey = this.withNamespace(key);
    const value = this.storage.getItem(namespacedKey);

    if (value === null) {
      return null;
    }

    return this.deserialize<T>(key, value);
  }

  async set<T>(key: string, value: T): Promise<void> {
    const namespacedKey = this.withNamespace(key);
    const serialized = this.serialize(key, value);

    try {
      this.storage.setItem(namespacedKey, serialized);
    } catch (error) {
      if (isQuotaError(error)) {
        throw new StorageError("LocalStorage quota exceeded", "QUOTA_EXCEEDED");
      }

      throw new StorageError(
        `Failed to persist value for key ${key}: ${(error as Error).message}`,
        "UNKNOWN"
      );
    }
  }

  async remove(key: string): Promise<void> {
    const namespacedKey = this.withNamespace(key);
    this.storage.removeItem(namespacedKey);
  }

  async clear(): Promise<void> {
    if (!this.namespacePrefix) {
      this.storage.clear();
      return;
    }

    this.listNamespacedKeys().forEach((key) => {
      this.storage.removeItem(key);
    });
  }

  async keys(): Promise<string[]> {
    const keys = this.listNamespacedKeys();
    return keys.map((key) => this.stripNamespace(key));
  }

  async has(key: string): Promise<boolean> {
    const namespacedKey = this.withNamespace(key);
    return this.storage.getItem(namespacedKey) !== null;
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
