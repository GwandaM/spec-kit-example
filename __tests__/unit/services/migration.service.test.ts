import { STORAGE_KEYS, type StorageAdapter } from "@/lib/storage/adapter";
import {
  MigrationService,
  type MigrationDefinition,
} from "@/src/server/services/migration.service";

type StoreRecord = Record<string, unknown>;

class InMemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, unknown>();

  constructor(initial: StoreRecord = {}) {
    Object.entries(initial).forEach(([key, value]) => {
      this.store.set(key, value);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}

const baseSettings = (overrides: Partial<Record<string, unknown>> = {}) => ({
  currency: "USD",
  locale: "en-US",
  theme: "system",
  pinHash: "",
  pinSalt: "",
  pinHint: null,
  lockTimeout: 0,
  failedAttempts: 0,
  lockedUntil: null,
  dataVersion: "1.0.0",
  retentionPeriod: 12,
  analyticsConsent: false,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

describe("MigrationService", () => {
  it("returns early when data version matches latest", async () => {
    const adapter = new InMemoryStorageAdapter({
      [STORAGE_KEYS.SETTINGS]: baseSettings(),
    });

    const service = new MigrationService(adapter, {
      migrations: [
        {
          version: "1.0.0",
          description: "Initial schema",
          migrate: async (snapshot) => snapshot,
        },
      ],
    });

    const result = await service.run();

    expect(result.appliedVersions).toEqual([]);
    const settings = await adapter.get<ReturnType<typeof baseSettings>>(STORAGE_KEYS.SETTINGS);
    expect(settings?.dataVersion).toBe("1.0.0");
  });

  it("applies sequential migrations and updates the schema version", async () => {
    const adapter = new InMemoryStorageAdapter({
      [STORAGE_KEYS.SETTINGS]: baseSettings(),
      [STORAGE_KEYS.MEMBERS]: [{ id: "member-1", name: "Sky", shareRatio: 0.5 }],
    });

    const migrations: MigrationDefinition[] = [
      {
        version: "1.1.0",
        description: "Increase retention period",
        migrate: async (snapshot) => {
          const settings = snapshot[STORAGE_KEYS.SETTINGS] as Record<string, unknown>;
          settings.retentionPeriod = 18;
          snapshot.migrationLog = ["1.1.0"];
          return snapshot;
        },
      },
      {
        version: "1.2.0",
        description: "Add migration audit flag",
        migrate: async (snapshot) => {
          const log = (snapshot.migrationLog as string[]) ?? [];
          log.push("1.2.0");
          snapshot.migrationLog = log;
          snapshot.migratedTo = "1.2.0";
          return snapshot;
        },
      },
    ];

    const service = new MigrationService(adapter, { migrations });

    const result = await service.run("1.2.0");

    expect(result.appliedVersions).toEqual(["1.1.0", "1.2.0"]);
    const settings = await adapter.get<Record<string, any>>(STORAGE_KEYS.SETTINGS);
    expect(settings?.dataVersion).toBe("1.2.0");
    expect(settings?.retentionPeriod).toBe(18);

    const migrationLog = await adapter.get<string[]>("migrationLog");
    expect(migrationLog).toEqual(["1.1.0", "1.2.0"]);
    await expect(adapter.get("migratedTo")).resolves.toBe("1.2.0");
  });

  it("rolls back changes if a migration fails", async () => {
    const adapter = new InMemoryStorageAdapter({
      [STORAGE_KEYS.SETTINGS]: baseSettings(),
    });

    const migrations: MigrationDefinition[] = [
      {
        version: "1.1.0",
        description: "Introduce flag",
        migrate: async (snapshot) => {
          snapshot.flag = true;
          return snapshot;
        },
      },
      {
        version: "1.2.0",
        description: "Failing migration",
        migrate: async () => {
          throw new Error("intentional failure");
        },
      },
    ];

    const service = new MigrationService(adapter, { migrations });

    await expect(service.run("1.2.0")).rejects.toThrow("intentional failure");

    const settings = await adapter.get<Record<string, any>>(STORAGE_KEYS.SETTINGS);
    expect(settings?.dataVersion).toBe("1.0.0");
    expect(await adapter.has("flag")).toBe(false);
  });
});
