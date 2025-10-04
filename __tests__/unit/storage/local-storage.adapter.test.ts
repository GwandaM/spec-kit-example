import { LocalStorageAdapter } from "@/lib/storage/local-storage.adapter";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }

  key(index: number): string | null {
    const entries = Array.from(this.store.keys());
    return entries[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  setRaw(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("LocalStorageAdapter", () => {
  const createAdapter = (storage: Storage = new MemoryStorage() as Storage) =>
    new LocalStorageAdapter({ storage });

  it("stores and retrieves JSON-serializable values", async () => {
    const adapter = createAdapter();

    const payload = { id: "member-1", name: "Alex", shareRatio: 0.5 };
    await adapter.set("flatmate:members", [payload]);

    await expect(adapter.get<(typeof payload)[]>("flatmate:members")).resolves.toEqual([payload]);
  });

  it("returns null when the key is missing", async () => {
    const adapter = createAdapter();

    await expect(adapter.get("flatmate:expenses")).resolves.toBeNull();
    await expect(adapter.has("flatmate:expenses")).resolves.toBe(false);
  });

  it("removes individual keys", async () => {
    const adapter = createAdapter();

    await adapter.set("flatmate:notes", [{ id: "note-1" }]);
    await adapter.remove("flatmate:notes");

    await expect(adapter.get("flatmate:notes")).resolves.toBeNull();
    await expect(adapter.has("flatmate:notes")).resolves.toBe(false);
  });

  it("clears all data", async () => {
    const adapter = createAdapter();

    await adapter.set("key:a", { value: 1 });
    await adapter.set("key:b", { value: 2 });

    await adapter.clear();

    await expect(adapter.keys()).resolves.toEqual([]);
  });

  it("returns existing keys", async () => {
    const adapter = createAdapter();

    await adapter.set("key:a", 1);
    await adapter.set("key:b", 2);

    await expect(adapter.keys()).resolves.toEqual(["key:a", "key:b"]);
  });

  it("throws a StorageError on serialization failure", async () => {
    const adapter = createAdapter();
    const circular: any = {};
    circular.self = circular;

    await expect(adapter.set("flatmate:members", circular)).rejects.toMatchObject({
      name: "StorageError",
      code: "SERIALIZATION_ERROR",
    });
  });

  it("rethrows quota exceeded errors as StorageError", async () => {
    class QuotaStorage extends MemoryStorage {
      override setItem(): void {
        const error = new Error("Quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      }
    }

    const adapter = createAdapter(new QuotaStorage() as unknown as Storage);

    await expect(adapter.set("key:a", { value: 1 })).rejects.toMatchObject({
      name: "StorageError",
      code: "QUOTA_EXCEEDED",
    });
  });

  it("throws a StorageError on JSON parse failure", async () => {
    const storage = new MemoryStorage();
    storage.setRaw("flatmate:members", "{not-valid-json");
    const adapter = createAdapter(storage as unknown as Storage);

    await expect(adapter.get("flatmate:members")).rejects.toMatchObject({
      name: "StorageError",
      code: "SERIALIZATION_ERROR",
    });
  });
});
