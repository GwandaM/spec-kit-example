"use client";

/**
 * Goal Progress - Client Component
 * Displays fitness goal progress with visual indicator
 */

import { useEffect, useState } from "react";
import type { FitnessGoal } from "@/lib/types/entities";
import { getGoalProgress } from "@/src/server/actions/gym";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";

interface GoalProgressProps {
  goal: FitnessGoal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const [progress, setProgress] = useState<{
    progress: number;
    percentComplete: number;
    isComplete: boolean;
    sessionsCount: number;
    totalDuration: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      const result = await getGoalProgress(goal.id);

      if (result.success && result.data) {
        setProgress(result.data);
      }

      setIsLoading(false);
    };

    loadProgress();
  }, [goal.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (goal.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {goal.description}
            </CardTitle>
            <CardDescription className="mt-2">
              {goal.startDate.toLocaleDateString()} - {goal.endDate.toLocaleDateString()}
            </CardDescription>
          </div>
          {progress.isComplete && <Badge className="bg-green-500">Completed!</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {progress.progress} / {goal.targetValue}
              {goal.targetMetric === "sessionCount" ? " sessions" : " minutes"}
            </span>
          </div>
          <Progress value={progress.percentComplete} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress.percentComplete}% complete
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-2xl font-bold">{progress.sessionsCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">{progress.totalDuration}m</p>
          </div>
        </div>

        {!progress.isComplete && daysRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <TrendingUp className="h-4 w-4" />
            <span>{daysRemaining} days remaining</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
