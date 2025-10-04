import { STORAGE_KEYS, type StorageAdapter, type StorageKey } from "./adapter";
import { localStorageAdapter } from "./local-storage.adapter";
import type { Settings } from "@/lib/types/entities";
import { CURRENT_SCHEMA_VERSION } from "@/src/server/services/migration.service";

export type InitializationSeed = Partial<Record<StorageKey, unknown>> & {
  [STORAGE_KEYS.SETTINGS]?: Partial<Settings>;
};

export interface InitializeStorageOptions {
  adapter?: StorageAdapter;
  seed?: InitializationSeed;
  clock?: () => Date;
}

export interface InitializeStorageResult {
  initializedKeys: StorageKey[];
}

const buildDefaultSettings = (now: Date): Settings => ({
  currency: "USD",
  locale: "en-US",
  theme: "system",
  pinHash: "",
  pinSalt: "",
  pinHint: null,
  lockTimeout: 0,
  failedAttempts: 0,
  lockedUntil: null,
  dataVersion: CURRENT_SCHEMA_VERSION,
  retentionPeriod: 12,
  analyticsConsent: false,
  createdAt: now,
  updatedAt: now,
});

const defaultDataKeys: StorageKey[] = [
  STORAGE_KEYS.MEMBERS,
  STORAGE_KEYS.EXPENSES,
  STORAGE_KEYS.BALANCES,
  STORAGE_KEYS.GROCERIES,
  STORAGE_KEYS.CHORES,
  STORAGE_KEYS.CHORE_ASSIGNMENTS,
  STORAGE_KEYS.GYM_SESSIONS,
  STORAGE_KEYS.FITNESS_GOALS,
  STORAGE_KEYS.NOTES,
  STORAGE_KEYS.REMINDERS,
  STORAGE_KEYS.CHAT_MESSAGES,
];

export async function initializeStorage(
  options: InitializeStorageOptions = {}
): Promise<InitializeStorageResult> {
  const adapter = options.adapter ?? localStorageAdapter;
  const clock = options.clock ?? (() => new Date());
  const initializedKeys: StorageKey[] = [];

  const defaultSettings = {
    ...buildDefaultSettings(clock()),
    ...options.seed?.[STORAGE_KEYS.SETTINGS],
  };

  const defaultData: Partial<Record<StorageKey, unknown>> = {
    [STORAGE_KEYS.SETTINGS]: defaultSettings,
  };

  defaultDataKeys.forEach((key) => {
    defaultData[key] = options.seed?.[key] ?? [];
  });

  for (const key of Object.keys(defaultData) as StorageKey[]) {
    const exists = await adapter.has(key);
    if (!exists) {
      await adapter.set(key, defaultData[key]);
      initializedKeys.push(key);
    }
  }

  return { initializedKeys };
}
