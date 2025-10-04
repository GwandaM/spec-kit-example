"use client";

/**
 * Chore Card - Client Component
 * Individual chore card with completion action
 */

import { useState, useTransition } from "react";
import type { Chore, ChoreAssignment } from "@/lib/types/entities";
import { markChoreComplete } from "@/src/server/actions/chores";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChoreCardProps {
  chore: Chore;
  currentAssignment?: ChoreAssignment;
}

export function ChoreCard({ chore, currentAssignment }: ChoreCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentAssigneeIndex = chore.currentIndex;
  const currentAssignee = chore.rotationSequence[currentAssigneeIndex];
  const nextAssignee =
    chore.rotationSequence[(currentAssigneeIndex + 1) % chore.rotationSequence.length];

  const handleComplete = async () => {
    if (!currentAssignment) return;

    setError(null);
    startTransition(async () => {
      const result = await markChoreComplete(currentAssignment.id);

      if (!result.success) {
        setError(result.error || "Failed to mark chore as complete");
        return;
      }

      router.refresh();
    });
  };

  const isOverdue =
    currentAssignment && currentAssignment.dueDate < new Date() && !currentAssignment.completedAt;

  return (
    <Card className={isOverdue ? "border-destructive" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{chore.name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline" className="text-xs">
                {chore.cadence}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Current:</span>
          <span className="font-medium">{currentAssignee}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Next:</span>
          <span className="font-medium">{nextAssignee}</span>
        </div>

        {currentAssignment && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Due:</span>
            <span className={isOverdue ? "font-medium text-destructive" : "font-medium"}>
              {currentAssignment.dueDate.toLocaleDateString()}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>

      <CardFooter>
        {currentAssignment && !currentAssignment.completedAt && (
          <Button onClick={handleComplete} disabled={isPending} className="w-full" size="sm">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isPending ? "Marking Complete..." : "Mark Complete"}
          </Button>
        )}
        {!currentAssignment && (
          <p className="text-sm text-muted-foreground w-full text-center">No active assignment</p>
        )}
      </CardFooter>
    </Card>
  );
}
