"use client";

/**
 * Message Input - Client Component
 * Form for sending chat messages
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/src/server/actions/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";

interface MessageInputProps {
  authorId: string;
}

export function MessageInput({ authorId }: MessageInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setError(null);

    startTransition(async () => {
      const result = await sendMessage({
        content: content.trim(),
        authorId,
      });

      if (!result.success) {
        setError(result.error || "Failed to send message");
        return;
      }

      // Clear input
      setContent("");
      router.refresh();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            maxLength={1000}
            rows={3}
            disabled={isPending}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{content.length}/1000 characters</p>
            <Button type="submit" disabled={isPending || !content.trim()} size="sm">
              <Send className="mr-2 h-4 w-4" />
              {isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
