"use client";

/**
 * Session Form - Client Component
 * Form for logging gym sessions
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logGymSession } from "@/src/server/actions/gym";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SessionFormProps {
  memberId: string;
  onSuccess?: () => void;
}

export function SessionForm({ memberId, onSuccess }: SessionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "cardio" as "cardio" | "strength" | "other",
    duration: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await logGymSession({
        memberId,
        type: formData.type,
        duration: parseInt(formData.duration),
        date: new Date(formData.date),
        notes: formData.notes || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to log session");
        return;
      }

      // Reset form
      setFormData({
        type: "cardio",
        duration: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });

      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Gym Session</CardTitle>
        <CardDescription>Track your workout progress</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Workout Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "cardio" | "strength" | "other") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="600"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="45"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="5km run, felt great!"
              maxLength={500}
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Logging..." : "Log Session"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
