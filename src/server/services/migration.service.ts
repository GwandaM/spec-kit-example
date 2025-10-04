import { STORAGE_KEYS, type StorageAdapter } from "@/lib/storage/adapter";
import type { Settings } from "@/lib/types/entities";

type StorageSnapshot = Record<string, any>;

export interface MigrationDefinition {
  version: string;
  description?: string;
  migrate: (snapshot: StorageSnapshot) => Promise<StorageSnapshot> | StorageSnapshot;
}

export interface MigrationServiceOptions {
  migrations?: MigrationDefinition[];
}

export interface MigrationResult {
  appliedVersions: string[];
  initialVersion: string;
  finalVersion: string;
}

const DEFAULT_MIGRATIONS: MigrationDefinition[] = [
  {
    version: "1.0.0",
    description: "Initial schema version",
    migrate: async (snapshot) => snapshot,
  },
];

const compareVersions = (a: string, b: string): number => {
  const aParts = a.split(".").map((part) => Number.parseInt(part, 10));
  const bParts = b.split(".").map((part) => Number.parseInt(part, 10));

  for (let index = 0; index < Math.max(aParts.length, bParts.length); index += 1) {
    const aValue = aParts[index] ?? 0;
    const bValue = bParts[index] ?? 0;

    if (aValue > bValue) {
      return 1;
    }

    if (aValue < bValue) {
      return -1;
    }
  }

  return 0;
};

const cloneSnapshot = (snapshot: StorageSnapshot): StorageSnapshot => {
  if (typeof structuredClone === "function") {
    return structuredClone(snapshot);
  }

  return JSON.parse(JSON.stringify(snapshot));
};

export class MigrationService {
  private readonly migrations: MigrationDefinition[];
  private readonly latestVersion: string;

  constructor(
    private readonly storageAdapter: StorageAdapter,
    options: MigrationServiceOptions = {}
  ) {
    const configuredMigrations = options.migrations ?? DEFAULT_MIGRATIONS;

    this.migrations = [...configuredMigrations].sort((left, right) =>
      compareVersions(left.version, right.version)
    );
    this.latestVersion = this.migrations.at(-1)?.version ?? "1.0.0";
  }

  async run(targetVersion = this.latestVersion): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion();

    if (compareVersions(currentVersion, targetVersion) >= 0) {
      return {
        appliedVersions: [],
        initialVersion: currentVersion,
        finalVersion: currentVersion,
      };
    }

    const resolvedTarget =
      compareVersions(targetVersion, this.latestVersion) > 0 ? this.latestVersion : targetVersion;

    const migrationsToRun = this.migrations.filter((migration) => {
      return (
        compareVersions(migration.version, currentVersion) > 0 &&
        compareVersions(migration.version, resolvedTarget) <= 0
      );
    });

    if (!migrationsToRun.length) {
      return {
        appliedVersions: [],
        initialVersion: currentVersion,
        finalVersion: currentVersion,
      };
    }

    const originalSnapshot = await this.loadSnapshot();
    let workingSnapshot = cloneSnapshot(originalSnapshot);
    const appliedVersions: string[] = [];

    try {
      for (const migration of migrationsToRun) {
        workingSnapshot = await Promise.resolve(migration.migrate(workingSnapshot));
        appliedVersions.push(migration.version);
      }

      const finalVersion = appliedVersions.at(-1) ?? currentVersion;
      const updatedSnapshot = this.updateSettingsVersion(workingSnapshot, finalVersion);

      await this.persistSnapshot(originalSnapshot, updatedSnapshot);

      return {
        appliedVersions,
        initialVersion: currentVersion,
        finalVersion,
      };
    } catch (error) {
      throw error;
    }
  }

  private async getCurrentVersion(): Promise<string> {
    const settings = await this.storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    return settings?.dataVersion ?? "0.0.0";
  }

  private async loadSnapshot(): Promise<StorageSnapshot> {
    const snapshot: StorageSnapshot = {};
    const keys = await this.storageAdapter.keys();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.storageAdapter.get<unknown>(key);
        if (value !== null) {
          snapshot[key] = value;
        }
      })
    );

    return snapshot;
  }

  private updateSettingsVersion(snapshot: StorageSnapshot, version: string): StorageSnapshot {
    const settings = snapshot[STORAGE_KEYS.SETTINGS] as Settings | undefined;

    if (!settings) {
      throw new Error("Settings must exist before running migrations");
    }

    snapshot[STORAGE_KEYS.SETTINGS] = {
      ...settings,
      dataVersion: version,
      updatedAt: new Date(),
    };

    return snapshot;
  }

  private async persistSnapshot(
    originalSnapshot: StorageSnapshot,
    updatedSnapshot: StorageSnapshot
  ): Promise<void> {
    const updatedKeys = Object.keys(updatedSnapshot);
    const originalKeys = new Set(Object.keys(originalSnapshot));

    for (const key of updatedKeys) {
      const value = updatedSnapshot[key];
      if (typeof value === "undefined") {
        await this.storageAdapter.remove(key);
      } else {
        await this.storageAdapter.set(key, value);
      }
    }

    for (const key of originalKeys) {
      if (!(key in updatedSnapshot)) {
        await this.storageAdapter.remove(key);
      }
    }
  }
}

export const CURRENT_SCHEMA_VERSION = DEFAULT_MIGRATIONS.at(-1)?.version ?? "1.0.0";
