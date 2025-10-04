/**
 * Message List - Server Component
 * Displays chat messages in chronological order
 */

import { getMessages } from "@/src/server/actions/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

export async function MessageList() {
  const result = await getMessages({ limit: 50 });

  if (!result.success || !result.messages || result.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No messages yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {result.messages.map((message) => (
        <Card key={message.id}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.authorId.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{message.authorId}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.editedAt && (
                    <span className="text-xs text-muted-foreground italic">(edited)</span>
                  )}
                </div>

                <p className={`text-sm ${message.isDeleted ? "italic text-muted-foreground" : ""}`}>
                  {message.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
