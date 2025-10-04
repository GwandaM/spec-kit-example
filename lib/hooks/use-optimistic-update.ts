"use client";

/**
 * useOptimisticUpdate Hook
 * React hook for optimistic UI updates with rollback on failure
 */

import { useState, useTransition, useCallback } from "react";

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error: string | null;
}

export function useOptimisticUpdate<T, TInput = unknown>(
  initialData: T,
  updateFn: (input: TInput) => Promise<{ success: boolean; data?: T; error?: string }>
) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null,
  });

  const update = useCallback(
    async (input: TInput, optimisticData?: T) => {
      // Store current data for rollback
      const previousData = state.data;

      // Apply optimistic update if provided
      if (optimisticData) {
        setState({
          data: optimisticData,
          isOptimistic: true,
          error: null,
        });
      }

      startTransition(async () => {
        try {
          const result = await updateFn(input);

          if (result.success && result.data) {
            // Update with actual data
            setState({
              data: result.data,
              isOptimistic: false,
              error: null,
            });
          } else {
            // Rollback on failure
            setState({
              data: previousData,
              isOptimistic: false,
              error: result.error || "Update failed",
            });
          }
        } catch (error) {
          // Rollback on error
          setState({
            data: previousData,
            isOptimistic: false,
            error: error instanceof Error ? error.message : "Update failed",
          });
        }
      });
    },
    [state.data, updateFn]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setData = useCallback((data: T) => {
    setState({
      data,
      isOptimistic: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    isPending,
    update,
    clearError,
    setData,
  };
}
