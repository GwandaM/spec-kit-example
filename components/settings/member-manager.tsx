"use client";

/**
 * Member Manager - Client Component
 * Manage household members (add/remove/edit)
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/types/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus } from "lucide-react";

interface MemberManagerProps {
  members: Member[];
}

export function MemberManager({ members: initialMembers }: MemberManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [newMember, setNewMember] = useState({
    name: "",
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    shareRatio: "1.0",
  });

  const activeMembers = initialMembers.filter((m) => m.isActive);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeMembers.length >= 12) {
      setError("Maximum 12 members allowed per household");
      return;
    }

    startTransition(async () => {
      // TODO: Implement addMember Server Action
      // const result = await addMember({
      //   name: newMember.name,
      //   color: newMember.color,
      //   shareRatio: parseFloat(newMember.shareRatio)
      // })

      // Placeholder implementation
      console.log("Add member:", newMember);

      // Reset form
      setNewMember({
        name: "",
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        shareRatio: "1.0",
      });
      setIsAdding(false);
      router.refresh();
    });
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setError(null);

    startTransition(async () => {
      // TODO: Implement removeMember Server Action
      // const result = await removeMember(memberId)

      console.log("Remove member:", memberId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Household Members</CardTitle>
          <CardDescription>{activeMembers.length} of 12 members</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {activeMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback style={{ backgroundColor: member.color }}>
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">Share ratio: {member.shareRatio}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMember(member.id)}
                disabled={isPending || activeMembers.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>

        {error && (
          <CardContent>
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        )}

        <CardFooter>
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              variant="outline"
              className="w-full"
              disabled={activeMembers.length >= 12}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          ) : (
            <form onSubmit={handleAddMember} className="w-full space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Doe"
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newMember.color}
                    onChange={(e) => setNewMember({ ...newMember, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={newMember.color}
                    onChange={(e) => setNewMember({ ...newMember, color: e.target.value })}
                    placeholder="#000000"
                    maxLength={7}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shareRatio">Share Ratio</Label>
                <Input
                  id="shareRatio"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={newMember.shareRatio}
                  onChange={(e) => setNewMember({ ...newMember, shareRatio: e.target.value })}
                  placeholder="1.0"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? "Adding..." : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
