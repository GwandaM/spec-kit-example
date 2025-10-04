/**
 * Chore List - Server Component
 * Displays active chores with current assignments
 */

import { listChores, listChoreAssignments } from "@/src/server/actions/chores";
import { ChoreCard } from "./chore-card";

export async function ChoreList() {
  const chores = await listChores();
  const assignments = await listChoreAssignments();

  if (chores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No chores yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create your first chore to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chores.map((chore) => {
        const choreAssignments = assignments.filter((a) => a.choreId === chore.id);
        const currentAssignment = choreAssignments.find((a) => !a.completedAt);

        return <ChoreCard key={chore.id} chore={chore} currentAssignment={currentAssignment} />;
      })}
    </div>
  );
}
