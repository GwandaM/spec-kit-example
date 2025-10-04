"use client";

/**
 * useClientStore Hook
 * React hook for client-side state management with Zustand-like API
 */

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

interface Store<T> {
  state: T;
  listeners: Set<Listener>;
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

export function createClientStore<T>(initialState: T): Store<T> {
  const listeners = new Set<Listener>();
  let state = initialState;

  const getState = (): T => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)): void => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    state,
    listeners,
    getState,
    setState,
    subscribe,
  };
}

export function useClientStore<T, U = T>(store: Store<T>, selector?: (state: T) => U): U {
  const getSnapshot = useCallback(
    () => (selector ? selector(store.getState()) : (store.getState() as unknown as U)),
    [store, selector]
  );

  const subscribe = useCallback((listener: Listener) => store.subscribe(listener), [store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Example usage:
// const counterStore = createClientStore({ count: 0 })
//
// function Counter() {
//   const count = useClientStore(counterStore, (state) => state.count)
//
//   const increment = () => {
//     counterStore.setState((state) => ({ count: state.count + 1 }))
//   }
//
//   return <button onClick={increment}>{count}</button>
// }
