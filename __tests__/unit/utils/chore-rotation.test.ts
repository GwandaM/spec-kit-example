import { getNextAssignee, type RotationRequest } from "@/lib/utils/chore-rotation";

describe("getNextAssignee", () => {
  const baseRequest: RotationRequest = {
    sequence: ["alice", "bob", "carla"],
    currentIndex: 0,
  };

  it("advances sequentially to the next member", () => {
    const result = getNextAssignee(baseRequest);
    expect(result).toEqual({ memberId: "bob", nextIndex: 1 });
  });

  it("wraps around to the start of the sequence", () => {
    const result = getNextAssignee({
      sequence: ["alice", "bob", "carla"],
      currentIndex: 2,
    });

    expect(result).toEqual({ memberId: "alice", nextIndex: 0 });
  });

  it("supports manual override without disturbing sequence order", () => {
    const result = getNextAssignee(baseRequest, { overrideMemberId: "carla" });

    expect(result).toEqual({ memberId: "carla", nextIndex: 2 });
  });

  it("skips members that are temporarily unavailable", () => {
    const result = getNextAssignee(baseRequest, { skipMembers: ["bob"] });

    expect(result).toEqual({ memberId: "carla", nextIndex: 2 });
  });

  it("throws when sequence is empty", () => {
    expect(() => getNextAssignee({ sequence: [], currentIndex: 0 })).toThrow(
      "Rotation sequence must include at least one member"
    );
  });

  it("throws when override target is not in the sequence", () => {
    expect(() => getNextAssignee(baseRequest, { overrideMemberId: "daisy" })).toThrow(
      "Override member daisy is not part of the rotation sequence"
    );
  });

  it("throws when all members are skipped", () => {
    expect(() => getNextAssignee(baseRequest, { skipMembers: ["alice", "bob", "carla"] })).toThrow(
      "No eligible member found for rotation"
    );
  });
});
