export interface RotationRequest {
  sequence: string[];
  currentIndex: number;
}

export interface RotationOptions {
  skipMembers?: string[];
  overrideMemberId?: string;
}

export interface RotationResult {
  memberId: string;
  nextIndex: number;
}

const ensureSequence = (sequence: string[]): void => {
  if (!sequence.length) {
    throw new Error("Rotation sequence must include at least one member");
  }
};

export function getNextAssignee(
  { sequence, currentIndex }: RotationRequest,
  options: RotationOptions = {}
): RotationResult {
  ensureSequence(sequence);

  if (options.overrideMemberId) {
    const targetIndex = sequence.indexOf(options.overrideMemberId);
    if (targetIndex === -1) {
      throw new Error(
        `Override member ${options.overrideMemberId} is not part of the rotation sequence`
      );
    }

    return {
      memberId: sequence[targetIndex],
      nextIndex: targetIndex,
    };
  }

  const skipSet = new Set(options.skipMembers ?? []);
  const sequenceLength = sequence.length;

  for (let step = 0; step < sequenceLength; step += 1) {
    const nextIndex = (currentIndex + 1 + step) % sequenceLength;
    const candidate = sequence[nextIndex];

    if (!skipSet.has(candidate)) {
      return {
        memberId: candidate,
        nextIndex,
      };
    }
  }

  throw new Error("No eligible member found for rotation");
}
