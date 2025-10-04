"use server";

/**
 * Auth Server Actions
 * Handles PIN authentication with rate limiting and lockout
 */

import { revalidatePath } from "next/cache";
import {
  setupPinSchema,
  verifyPinSchema,
  changePinSchema,
} from "@/src/server/validators/shared.schema";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import { hashPin, verifyPin as verifyPinHash } from "@/lib/utils/crypto";
import type { Settings } from "@/lib/types/entities";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Setup PIN during first-run
 */
export async function setupPin(input: unknown) {
  try {
    const validated = setupPinSchema.parse(input);

    const settings = await storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    if (!settings) {
      return { success: false, error: "Settings not initialized" };
    }

    // Check if PIN already exists
    if (settings.pinHash) {
      return { success: false, error: "PIN already configured. Use changePin instead." };
    }

    // Hash PIN with salt
    const { hash, salt } = await hashPin(validated.pin);

    // Update settings
    settings.pinHash = hash;
    settings.pinSalt = salt;
    settings.pinHint = validated.hint || null;
    settings.failedAttempts = 0;
    settings.lockedUntil = null;
    settings.updatedAt = new Date();

    await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

    revalidatePath("/auth");
    revalidatePath("/setup");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to setup PIN",
    };
  }
}

/**
 * Verify PIN with rate limiting
 */
export async function verifyPin(input: unknown) {
  try {
    const validated = verifyPinSchema.parse(input);

    const settings = await storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    if (!settings || !settings.pinHash || !settings.pinSalt) {
      return { success: false, error: "PIN not configured" };
    }

    // Check if locked
    if (settings.lockedUntil && settings.lockedUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil(
        (settings.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return {
        success: false,
        error: `Account locked. Try again in ${remainingMinutes} minute(s).`,
        locked: true,
        lockedUntil: settings.lockedUntil,
      };
    }

    // Verify PIN
    const isValid = await verifyPinHash(validated.pin, settings.pinHash, settings.pinSalt);

    if (isValid) {
      // Reset failed attempts
      settings.failedAttempts = 0;
      settings.lockedUntil = null;
      settings.updatedAt = new Date();

      await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

      revalidatePath("/auth");

      return { success: true };
    } else {
      // Increment failed attempts
      settings.failedAttempts = (settings.failedAttempts || 0) + 1;
      settings.updatedAt = new Date();

      // Apply lockout if max attempts reached
      if (settings.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        settings.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

      // Calculate progressive delay
      const delay = getProgressiveDelay(settings.failedAttempts);

      return {
        success: false,
        error: "Invalid PIN",
        failedAttempts: settings.failedAttempts,
        delay,
        locked: settings.failedAttempts >= MAX_FAILED_ATTEMPTS,
        lockedUntil: settings.lockedUntil,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify PIN",
    };
  }
}

/**
 * Change PIN (requires current PIN verification)
 */
export async function changePin(input: unknown) {
  try {
    const validated = changePinSchema.parse(input);

    const settings = await storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    if (!settings || !settings.pinHash || !settings.pinSalt) {
      return { success: false, error: "PIN not configured" };
    }

    // Verify current PIN
    const isValid = await verifyPinHash(validated.currentPin, settings.pinHash, settings.pinSalt);

    if (!isValid) {
      return { success: false, error: "Current PIN is incorrect" };
    }

    // Hash new PIN
    const { hash, salt } = await hashPin(validated.newPin);

    // Update settings
    settings.pinHash = hash;
    settings.pinSalt = salt;
    settings.pinHint = validated.hint || settings.pinHint;
    settings.failedAttempts = 0;
    settings.lockedUntil = null;
    settings.updatedAt = new Date();

    await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

    revalidatePath("/auth");
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change PIN",
    };
  }
}

/**
 * Lock app immediately
 */
export async function lockApp() {
  try {
    const settings = await storageAdapter.get<Settings>(STORAGE_KEYS.SETTINGS);

    if (!settings) {
      return { success: false, error: "Settings not initialized" };
    }

    // Set lock timeout based on settings
    const lockTimeoutMs = settings.lockTimeout * 60 * 1000; // Convert minutes to ms

    if (lockTimeoutMs > 0) {
      settings.lockedUntil = new Date(Date.now() + lockTimeoutMs);
    } else {
      // If lockTimeout is 0, lock indefinitely (until PIN verification)
      settings.lockedUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }

    settings.updatedAt = new Date();

    await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);

    revalidatePath("/auth");
    revalidatePath("/");

    return { success: true, lockedUntil: settings.lockedUntil };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to lock app",
    };
  }
}

/**
 * Check if app is currently locked
 */
export async function isAppLocked() {
  try {
    const settings = await storageAdapter.get<Settings>("flatmate:settings");

    if (!settings) {
      return { success: true, locked: false };
    }

    const locked = settings.lockedUntil && settings.lockedUntil.getTime() > Date.now();

    return {
      success: true,
      locked: !!locked,
      lockedUntil: locked ? settings.lockedUntil : null,
      failedAttempts: settings.failedAttempts || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check lock status",
    };
  }
}

/**
 * Get progressive delay based on failed attempts
 * Progressive delay: 1s, 2s, 4s, 8s, 16s (capped at 16s)
 */
function getProgressiveDelay(attempts: number): number {
  return Math.min(Math.pow(2, attempts) * 1000, 16000);
}
