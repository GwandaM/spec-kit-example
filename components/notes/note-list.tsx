/**
 * Note List - Server Component
 * Displays notes with filtering by type
 */

import { storageAdapter } from "@/lib/storage/adapter";
import type { Note } from "@/lib/types/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";

interface NoteListProps {
  showArchived?: boolean;
}

export async function NoteList({ showArchived = false }: NoteListProps) {
  const notes = (await storageAdapter.get<Note[]>("flatmate:notes")) || [];

  const filteredNotes = notes
    .filter((note) => (showArchived ? note.isArchived : !note.isArchived))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {showArchived ? "No archived notes." : "No notes yet."}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {showArchived
            ? "Archive notes to see them here."
            : "Create your first note to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotes.map((note) => (
        <Card key={note.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <Badge
                    variant={
                      note.type === "general"
                        ? "default"
                        : note.type === "shoppingList"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {note.type === "shoppingList" ? "Shopping List" : note.type}
                  </Badge>
                  <span className="text-xs">
                    {new Date(note.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {note.type === "shoppingList" ? (
              <div className="space-y-1">
                {(() => {
                  try {
                    const items = JSON.parse(note.content) as Array<{
                      item: string;
                      checked: boolean;
                    }>;
                    return items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          readOnly
                          className="rounded"
                        />
                        <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                          {item.item}
                        </span>
                      </div>
                    ));
                  } catch {
                    return <p className="text-sm text-muted-foreground">{note.content}</p>;
                  }
                })()}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
