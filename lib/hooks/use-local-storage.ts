"use client";

/**
 * useLocalStorage Hook
 * React hook for direct LocalStorage access with type safety
 */

import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Get from local storage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch custom event for cross-tab synchronization
        window.dispatchEvent(
          new CustomEvent("local-storage-change", {
            detail: { key, value: valueToStore },
          })
        );
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent("local-storage-change", {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing storage change:", error);
        }
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-change", handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-change",
        handleCustomStorageChange as EventListener
      );
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}
