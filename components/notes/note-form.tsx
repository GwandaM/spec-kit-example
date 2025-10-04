"use client";

/**
 * Note Form - Client Component
 * Form for creating and editing notes
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNote } from "@/src/server/actions/notes";
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

interface NoteFormProps {
  createdBy: string;
  onSuccess?: () => void;
}

export function NoteForm({ createdBy, onSuccess }: NoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general" as "general" | "shoppingList" | "reminder",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createNote({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        createdBy,
      });

      if (!result.success) {
        setError(result.error || "Failed to create note");
        return;
      }

      // Reset form
      setFormData({
        title: "",
        content: "",
        type: "general",
      });

      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Note</CardTitle>
        <CardDescription>Add a shared note or reminder</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Meeting notes, shopping list..."
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "general" | "shoppingList" | "reminder") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="shoppingList">Shopping List</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={
                formData.type === "shoppingList" ? "Milk\nBread\nEggs" : "Add your note here..."
              }
              maxLength={2000}
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.type === "shoppingList" && "Enter one item per line"}
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating..." : "Create Note"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
