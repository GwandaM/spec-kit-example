"use server";

import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter } from "@/lib/storage/local-storage.adapter";
import type { Member } from "@/lib/types/entities";

const reviveMember = (member: Member): Member => ({
  ...member,
  createdAt: new Date(member.createdAt),
});

export async function listMembers(options: { includeInactive?: boolean } = {}): Promise<Member[]> {
  const members = (await localStorageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];
  const revived = members.map(reviveMember);

  if (options.includeInactive) {
    return revived;
  }

  return revived.filter((member) => member.isActive);
}

export async function getMemberById(memberId: string): Promise<Member | undefined> {
  const members = await listMembers();
  return members.find((member) => member.id === memberId);
}
