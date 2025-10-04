"use client";

/**
 * PIN Entry - Client Component
 * 4-digit PIN input with masking and rate limiting
 */

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyPin } from "@/src/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";

interface PinEntryProps {
  onSuccess?: () => void;
}

export function PinEntry({ onSuccess }: PinEntryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const locked = lockedUntil.getTime();
      const remaining = Math.max(0, Math.ceil((locked - now) / 1000));

      setRemainingTime(remaining);

      if (remaining === 0) {
        setIsLocked(false);
        setLockedUntil(null);
        setError(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    setError(null);

    startTransition(async () => {
      const result = await verifyPin({ pin });

      if (!result.success) {
        setError(result.error || "Invalid PIN");
        setPin("");

        if ("failedAttempts" in result) {
          setFailedAttempts(result.failedAttempts as number);
        }

        if ("locked" in result && result.locked && "lockedUntil" in result) {
          setIsLocked(true);
          setLockedUntil(result.lockedUntil as Date);
        }

        return;
      }

      // Success
      setPin("");
      setFailedAttempts(0);
      setIsLocked(false);
      setLockedUntil(null);

      router.refresh();
      onSuccess?.();
    });
  };

  const handlePinChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setPin(cleaned);
  };

  const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Enter PIN</CardTitle>
          <CardDescription>Enter your 4-6 digit PIN to unlock</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                disabled={isPending || isLocked}
                autoFocus
              />
            </div>

            {failedAttempts > 0 && !isLocked && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {failedAttempts} failed attempt{failedAttempts > 1 ? "s" : ""}.
                  {failedAttempts >= 3 &&
                    ` ${5 - failedAttempts} attempts remaining before lockout.`}
                </AlertDescription>
              </Alert>
            )}

            {isLocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Too many failed attempts. Locked for {formatRemainingTime(remainingTime)}.
                </AlertDescription>
              </Alert>
            )}

            {error && !isLocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isPending || isLocked || pin.length < 4}
              className="w-full"
            >
              {isPending ? "Verifying..." : "Unlock"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
