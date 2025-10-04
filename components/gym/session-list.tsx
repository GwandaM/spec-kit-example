/**
 * Session List - Server Component
 * Displays gym sessions with filtering
 */

import { listGymSessions } from "@/src/server/actions/gym";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock } from "lucide-react";

interface SessionListProps {
  memberId?: string;
}

export async function SessionList({ memberId }: SessionListProps) {
  const sessions = await listGymSessions(memberId);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No gym sessions logged yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Start tracking your workouts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">
                  {session.date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={
                      session.type === "cardio"
                        ? "default"
                        : session.type === "strength"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {session.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{session.duration} min</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {session.notes && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
