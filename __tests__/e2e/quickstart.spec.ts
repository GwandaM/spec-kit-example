import { test, expect } from "@playwright/test";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Member } from "@/lib/types/entities";
import type { LocalStorageAdapter } from "@/lib/storage/local-storage.adapter";

const storageState = new Map<string, string>();

const ensureTestEnvironment = () => {
  if (typeof globalThis.localStorage === "undefined") {
    const localStorageMock: Storage = {
      get length() {
        return storageState.size;
      },
      clear() {
        storageState.clear();
      },
      getItem(key: string) {
        return storageState.has(key) ? storageState.get(key)! : null;
      },
      key(index: number) {
        return Array.from(storageState.keys())[index] ?? null;
      },
      removeItem(key: string) {
        storageState.delete(key);
      },
      setItem(key: string, value: string) {
        storageState.set(key, value);
      },
    };

    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      configurable: true,
    });
  }

  if (typeof globalThis.crypto === "undefined") {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto as unknown as Crypto,
      configurable: true,
    });
  }

  if (
    typeof (globalThis as unknown as { __LOCAL_STORAGE_RESET__?: () => void })
      .__LOCAL_STORAGE_RESET__ === "undefined"
  ) {
    Object.defineProperty(globalThis, "__LOCAL_STORAGE_RESET__", {
      value: () => {
        storageState.clear();
      },
      configurable: true,
    });
  }
};

type ExpensesActions = typeof import("@/src/server/actions/expenses");
type ChoresActions = typeof import("@/src/server/actions/chores");
type GroceriesActions = typeof import("@/src/server/actions/groceries");
type GymActions = typeof import("@/src/server/actions/gym");
type NotesActions = typeof import("@/src/server/actions/notes");
type ChatActions = typeof import("@/src/server/actions/chat");

type InitializeStorage = typeof import("@/lib/storage/init").initializeStorage;

const BASE_TIME = new Date("2024-01-01T08:00:00.000Z").getTime();

const members: Member[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    name: "Alice",
    color: "#f87171",
    shareRatio: 0.34,
    createdAt: new Date(BASE_TIME),
    isActive: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    name: "Bob",
    color: "#60a5fa",
    shareRatio: 0.33,
    createdAt: new Date(BASE_TIME),
    isActive: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    name: "Carla",
    color: "#34d399",
    shareRatio: 0.33,
    createdAt: new Date(BASE_TIME),
    isActive: true,
  },
];

let initializeStorage: InitializeStorage;
let storageAdapter: LocalStorageAdapter;
let STORAGE_KEYS: typeof import("@/lib/storage/adapter").STORAGE_KEYS;
let expensesActions: ExpensesActions;
let choresActions: ChoresActions;
let groceriesActions: GroceriesActions;
let gymActions: GymActions;
let notesActions: NotesActions;
let chatActions: ChatActions;

const seedHousehold = async () => {
  await initializeStorage({
    adapter: storageAdapter,
    clock: () => new Date(BASE_TIME),
  });

  await storageAdapter.set(STORAGE_KEYS.MEMBERS, members);
};

test.describe("Quickstart scenarios", () => {
  test.beforeAll(async () => {
    ensureTestEnvironment();

    const initModule = await import("@/lib/storage/init");
    initializeStorage = initModule.initializeStorage;

    const adapterModule = await import("@/lib/storage/local-storage.adapter");
    storageAdapter = adapterModule.localStorageAdapter;

    const keysModule = await import("@/lib/storage/adapter");
    STORAGE_KEYS = keysModule.STORAGE_KEYS;

    expensesActions = await import("@/src/server/actions/expenses");
    choresActions = await import("@/src/server/actions/chores");
    groceriesActions = await import("@/src/server/actions/groceries");
    gymActions = await import("@/src/server/actions/gym");
    notesActions = await import("@/src/server/actions/notes");
    chatActions = await import("@/src/server/actions/chat");
  });

  test.beforeEach(async () => {
    (globalThis as unknown as { __LOCAL_STORAGE_RESET__?: () => void }).__LOCAL_STORAGE_RESET__?.();
    await seedHousehold();
  });

  test("Scenario 1: Split bill equally", async () => {
    const equalExpense = await expensesActions.createExpense({
      description: "Weekly groceries",
      amount: 90,
      currency: "USD",
      category: "Groceries",
      payerId: members[0].id,
      splitMode: "equal",
      participants: members.map((member) => ({
        memberId: member.id,
        amount: 30,
        percentage: null,
      })),
      notes: "Shared essentials",
      datetime: new Date(BASE_TIME + 86_400_000),
      createdBy: members[0].id,
    });

    expect(equalExpense.success).toBe(true);
    expect(equalExpense.balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fromMemberId: members[1].id,
          toMemberId: members[0].id,
          amount: 30,
        }),
        expect.objectContaining({
          fromMemberId: members[2].id,
          toMemberId: members[0].id,
          amount: 30,
        }),
      ])
    );
  });

  test("Scenario 2: Rotating cleaning schedule", async () => {
    const choreResult = await choresActions.createChore({
      name: "Kitchen deep clean",
      cadence: "weekly",
      rotationSequence: members.map((member) => member.id),
    });
    expect(choreResult.success).toBe(true);

    const recordedAssignees: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      const chore = (await choresActions.listChores())[0];
      const assignee = chore.rotationSequence[chore.currentIndex];
      recordedAssignees.push(assignee);

      const assignment = await choresActions.createChoreAssignment({
        choreId: chore.id,
        assignedTo: assignee,
        dueDate: new Date(BASE_TIME + (index + 1) * 86_400_000),
      });
      expect(assignment.success).toBe(true);

      const completion = await choresActions.markChoreComplete(assignment.assignment.id, assignee);
      expect(completion.success).toBe(true);
    }

    expect(recordedAssignees).toEqual([members[0].id, members[1].id, members[2].id]);
  });

  test("Scenario 3: Shared grocery tracking", async () => {
    const first = await groceriesActions.addGrocery({
      name: "Milk",
      quantity: 2,
      unit: "bottles",
      cost: 6.5,
      category: "Dairy",
      addedBy: members[1].id,
      purchasedAt: new Date(BASE_TIME + 2 * 86_400_000),
    });
    expect(first.success).toBe(true);

    const second = await groceriesActions.addGrocery({
      name: "Spinach",
      quantity: 3,
      unit: "bunches",
      cost: 4.25,
      category: "Produce",
      addedBy: members[2].id,
      purchasedAt: new Date(BASE_TIME + 2 * 86_400_000),
    });
    expect(second.success).toBe(true);

    const groceries = await groceriesActions.listGroceries();
    expect(groceries).toHaveLength(2);
    expect(groceries.map((item) => item.name)).toEqual(expect.arrayContaining(["Milk", "Spinach"]));
  });

  test("Scenario 4: Collective fitness goal", async () => {
    const goal = await gymActions.createFitnessGoal({
      description: "Collective cardio push",
      targetMetric: "sessionCount",
      targetValue: 12,
      period: "month",
      startDate: new Date(BASE_TIME),
      endDate: new Date(BASE_TIME + 30 * 86_400_000),
    });
    expect(goal.success).toBe(true);

    const session = await gymActions.logGymSession({
      memberId: members[0].id,
      date: new Date(BASE_TIME + 2 * 86_400_000),
      type: "cardio",
      duration: 45,
      notes: "Interval training",
    });
    expect(session.success).toBe(true);

    const storedGoals = await storageAdapter.get(STORAGE_KEYS.FITNESS_GOALS);
    expect(Array.isArray(storedGoals)).toBe(true);
    expect(storedGoals?.[0]?.description).toBe("Collective cardio push");
  });

  test("Scenario 5: Event reminder", async () => {
    const note = await notesActions.createNote({
      title: "House meeting agenda",
      content: "Discuss rent adjustments and cleaning schedule.",
      type: "general",
      createdBy: members[1].id,
    });
    expect(note.success).toBe(true);

    const reminder = await notesActions.createReminder({
      noteId: note.note.id,
      description: "Meeting starts in 1 hour",
      dueDate: new Date(BASE_TIME + 4 * 86_400_000),
      createdBy: members[1].id,
    });
    expect(reminder.success).toBe(true);

    const reminders = await storageAdapter.get(STORAGE_KEYS.REMINDERS);
    expect(reminders).toHaveLength(1);
    expect(reminders?.[0]?.noteId).toBe(note.note.id);
  });

  test("Scenario 6: Chat board communication", async () => {
    const message = await chatActions.sendMessage({
      content: "Remember to clean the oven today!",
      authorId: members[2].id,
    });
    expect(message.success).toBe(true);

    const edited = await chatActions.editMessage({
      id: message.message.id,
      content: "Remember to clean the oven before dinner! ⚡️",
    });
    expect(edited.success).toBe(true);

    const history = await chatActions.getMessages({ limit: 5 });
    expect(history.success).toBe(true);
    expect(history.messages[0]?.content).toContain("oven before dinner");
  });

  test("Scenario 7: Unequal expense split", async () => {
    const customExpense = await expensesActions.createExpense({
      description: "Home decor",
      amount: 150,
      currency: "USD",
      category: "Other",
      payerId: members[1].id,
      splitMode: "custom",
      participants: [
        { memberId: members[0].id, amount: 60, percentage: null },
        { memberId: members[1].id, amount: 30, percentage: null },
        { memberId: members[2].id, amount: 60, percentage: null },
      ],
      notes: "Living room upgrade",
      datetime: new Date(BASE_TIME + 5 * 86_400_000),
      createdBy: members[1].id,
    });

    expect(customExpense.success).toBe(true);
    expect(
      customExpense.expense.participants.find((p) => p.memberId === members[2].id)?.amount
    ).toBe(60);
  });

  test("Scenario 8: Settle balance", async () => {
    const expense = await expensesActions.createExpense({
      description: "Utilities",
      amount: 120,
      currency: "USD",
      category: "Bills",
      payerId: members[0].id,
      splitMode: "equal",
      participants: members.map((member) => ({
        memberId: member.id,
        amount: 40,
        percentage: null,
      })),
      notes: null,
      datetime: new Date(BASE_TIME + 6 * 86_400_000),
      createdBy: members[0].id,
    });
    expect(expense.success).toBe(true);

    const settlement = await expensesActions.settleExpense({
      expenseId: expense.expense.id,
      settledBy: members[1].id,
    });
    expect(settlement.success).toBe(true);
    expect(settlement.balances).toHaveLength(0);
  });

  test("Scenario 9: Duplicate grocery detection", async () => {
    const first = await groceriesActions.addGrocery({
      name: "Almond milk",
      quantity: 1,
      unit: "carton",
      cost: 3.99,
      category: "Dairy",
      addedBy: members[0].id,
      purchasedAt: new Date(BASE_TIME + 7 * 86_400_000),
    });
    expect(first.success).toBe(true);

    const duplicate = await groceriesActions.addGrocery({
      name: "Almond Milk",
      quantity: 1,
      unit: "carton",
      cost: 3.89,
      category: "Dairy",
      addedBy: members[2].id,
      purchasedAt: new Date(BASE_TIME + 7 * 86_400_000 + 3_600_000),
    });
    expect(duplicate.success).toBe(true);
    expect(duplicate.grocery.isDuplicate).toBe(true);
  });

  test("Scenario 10: PWA offline mode", async () => {
    const manifestPath = path.join(process.cwd(), "public", "manifest.json");
    const manifestRaw = await readFile(manifestPath, "utf8");
    const manifest = JSON.parse(manifestRaw);

    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(
      manifest.icons.some((icon: { purpose?: string }) => icon.purpose?.includes("maskable"))
    ).toBe(true);

    const configSource = await readFile(path.join(process.cwd(), "next.config.ts"), "utf8");
    expect(configSource).toContain("fallbacks: {\n    document: '/offline'");
    expect(configSource).toContain("skipWaiting: true");
  });
});
