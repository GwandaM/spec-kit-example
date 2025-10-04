import { initializeStorage } from "@/lib/storage/init";
import { localStorageAdapter } from "@/lib/storage/local-storage.adapter";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import type { Member } from "@/lib/types/entities";
import {
  createChore,
  createChoreAssignment,
  listChoreAssignments,
  listChores,
  markChoreComplete,
} from "@/src/server/actions/chores";

const aliceId = "00000000-0000-0000-0000-000000000011";
const bobId = "00000000-0000-0000-0000-000000000012";
const carlaId = "00000000-0000-0000-0000-000000000013";

const members: Member[] = [
  {
    id: aliceId,
    name: "Alice",
    color: "#f87171",
    shareRatio: 0.34,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: bobId,
    name: "Bob",
    color: "#60a5fa",
    shareRatio: 0.33,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
  {
    id: carlaId,
    name: "Carla",
    color: "#34d399",
    shareRatio: 0.33,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    isActive: true,
  },
];

describe("Chore rotation integration", () => {
  beforeEach(async () => {
    globalThis.__LOCAL_STORAGE_RESET__?.();
    await initializeStorage({ adapter: localStorageAdapter });
    await localStorageAdapter.set(STORAGE_KEYS.MEMBERS, members);
  });

  it("cycles through members in order when completing assignments", async () => {
    const choreResult = await createChore({
      name: "Kitchen cleaning",
      cadence: "weekly",
      rotationSequence: [aliceId, bobId, carlaId],
    });

    if (!choreResult.success) {
      throw new Error(choreResult.error ?? "chore creation failed");
    }
    expect(choreResult.success).toBe(true);

    const recordedAssignees: string[] = [];
    const baseDate = new Date(Date.now() + 86_400_000);

    for (let index = 0; index < 10; index += 1) {
      const chores = await listChores();
      const chore = chores[0];
      const currentAssignee = chore.rotationSequence[chore.currentIndex];
      recordedAssignees.push(currentAssignee);

      const assignmentResult = await createChoreAssignment({
        choreId: chore.id,
        assignedTo: currentAssignee,
        dueDate: new Date(baseDate.getTime() + index * 86_400_000),
      });

      if (!assignmentResult.success) {
        throw new Error(assignmentResult.error ?? "assignment creation failed");
      }
      expect(assignmentResult.success).toBe(true);

      const completionResult = await markChoreComplete(
        assignmentResult.assignment.id,
        currentAssignee
      );
      if (!completionResult.success) {
        throw new Error(completionResult.error ?? "mark complete failed");
      }
      expect(completionResult.success).toBe(true);

      const expectedNext = chore.rotationSequence[(index + 1) % chore.rotationSequence.length];
      expect(completionResult.nextAssignee).toBe(expectedNext);
    }

    const expectedOrder = [
      aliceId,
      bobId,
      carlaId,
      aliceId,
      bobId,
      carlaId,
      aliceId,
      bobId,
      carlaId,
      aliceId,
    ];
    expect(recordedAssignees).toEqual(expectedOrder);

    const finalChore = (await listChores())[0];
    expect(finalChore.currentIndex).toBe((0 + 10) % finalChore.rotationSequence.length);

    const assignments = await listChoreAssignments(finalChore.id);
    expect(assignments).toHaveLength(10);
    expect(assignments.every((assignment) => assignment.completedAt)).toBe(true);
  });
});
