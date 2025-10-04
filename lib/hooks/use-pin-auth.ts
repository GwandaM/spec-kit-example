"use client";

/**
 * usePinAuth Hook
 * React hook for PIN authentication state management
 */

import { useState, useEffect, useCallback } from "react";
import { isAppLocked } from "@/src/server/actions/auth";

interface PinAuthState {
  isLocked: boolean;
  lockedUntil: Date | null;
  failedAttempts: number;
  isLoading: boolean;
}

export function usePinAuth() {
  const [state, setState] = useState<PinAuthState>({
    isLocked: false,
    lockedUntil: null,
    failedAttempts: 0,
    isLoading: true,
  });

  // Check lock status on mount and periodically
  const checkLockStatus = useCallback(async () => {
    try {
      const result = await isAppLocked();

      if (result.success) {
        setState({
          isLocked: result.locked || false,
          lockedUntil: result.lockedUntil || null,
          failedAttempts: result.failedAttempts || 0,
          isLoading: false,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error checking lock status:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Check on mount
  useEffect(() => {
    checkLockStatus();
  }, [checkLockStatus]);

  // Auto-check periodically when locked
  useEffect(() => {
    if (!state.isLocked || !state.lockedUntil) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const locked = state.lockedUntil!.getTime();

      if (now >= locked) {
        // Lock expired, recheck status
        checkLockStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isLocked, state.lockedUntil, checkLockStatus]);

  // Calculate remaining lock time
  const getRemainingLockTime = useCallback((): number => {
    if (!state.lockedUntil) return 0;

    const now = new Date().getTime();
    const locked = state.lockedUntil.getTime();

    return Math.max(0, Math.ceil((locked - now) / 1000));
  }, [state.lockedUntil]);

  // Format remaining time as MM:SS
  const formatRemainingTime = useCallback((): string => {
    const seconds = getRemainingLockTime();
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, [getRemainingLockTime]);

  return {
    isLocked: state.isLocked,
    lockedUntil: state.lockedUntil,
    failedAttempts: state.failedAttempts,
    isLoading: state.isLoading,
    getRemainingLockTime,
    formatRemainingTime,
    refresh: checkLockStatus,
  };
}
