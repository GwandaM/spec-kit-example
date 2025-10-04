/**
 * Expense Server Actions
 * Implements FR-001 to FR-009b (Expense tracking & balances)
 */

"use server";

import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import type { Expense, Balance, Member } from "@/lib/types/entities";
import {
  createExpenseSchema,
  updateExpenseSchema,
  settleExpenseSchema,
} from "@/src/server/validators/expense.schema";
import { STORAGE_KEYS } from "@/lib/storage/adapter";
import { localStorageAdapter as storageAdapter } from "@/lib/storage/local-storage.adapter";
import { calculateBalances } from "@/lib/utils/balance-engine";

export interface ExpenseFilterOptions {
  category?: string;
  memberId?: string;
  from?: Date | string;
  to?: Date | string;
}

const normalizeDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const reviveExpense = (expense: Expense): Expense => {
  return {
    ...expense,
    datetime: new Date(expense.datetime),
    createdAt: new Date(expense.createdAt),
    updatedAt: new Date(expense.updatedAt),
    settledAt: expense.settledAt ? new Date(expense.settledAt) : null,
  };
};

export async function listExpenses(filters: ExpenseFilterOptions = {}): Promise<Expense[]> {
  const rawExpenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];

  const expenses = rawExpenses.map(reviveExpense);

  if (!expenses.length) {
    return [];
  }

  const from = normalizeDate(filters.from);
  const to = normalizeDate(filters.to);

  return expenses.filter((expense) => {
    if (expense.isSettled) {
      return false;
    }

    if (filters.category && expense.category !== filters.category) {
      return false;
    }

    if (filters.memberId) {
      const participates = expense.participants.some(
        (participant) => participant.memberId === filters.memberId
      );

      if (expense.payerId !== filters.memberId && !participates) {
        return false;
      }
    }

    if (from && expense.datetime < from) {
      return false;
    }

    if (to && expense.datetime > to) {
      return false;
    }

    return true;
  });
}

/**
 * Create a new expense and update balances
 */
export async function createExpense(
  input: unknown
): Promise<
  { success: true; expense: Expense; balances: Balance[] } | { success: false; error: string }
> {
  try {
    // Validate input with Zod schema
    const validated = createExpenseSchema.parse(input);

    // Fetch members to validate IDs
    const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];

    // Validate payer is active member
    const payer = members.find((m) => m.id === validated.payerId && m.isActive);
    if (!payer) {
      return { success: false, error: "Invalid payer ID or payer is inactive" };
    }

    // Validate all participants are active members
    for (const participant of validated.participants) {
      const member = members.find((m) => m.id === participant.memberId && m.isActive);
      if (!member) {
        return {
          success: false,
          error: `Invalid member ID: ${participant.memberId} or member is inactive`,
        };
      }
    }

    // Create expense entity
    const now = new Date();
    const expense: Expense = {
      id: uuidv4(),
      description: validated.description,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category,
      payerId: validated.payerId,
      splitMode: validated.splitMode,
      participants: validated.participants,
      notes: validated.notes,
      datetime: validated.datetime,
      createdBy: validated.createdBy,
      isSettled: false,
      settledAt: null,
      createdAt: now,
      updatedAt: now,
    };

    // Persist to storage
    const expenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];
    expenses.push(expense);
    await storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);

    // Recalculate balances for all expenses
    const balances = calculateBalances(expenses, members);
    await storageAdapter.set(STORAGE_KEYS.BALANCES, balances);

    // Invalidate cache
    revalidatePath("/expenses");
    revalidatePath("/");

    return { success: true, expense, balances };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

/**
 * Update an existing unsettled expense
 */
export async function updateExpense(
  id: string,
  input: unknown
): Promise<
  { success: true; expense: Expense; balances: Balance[] } | { success: false; error: string }
> {
  try {
    // Validate input with Zod schema
    const validated = updateExpenseSchema.parse(input);

    // Fetch expenses
    const expenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];

    // Find expense by ID
    const expenseIndex = expenses.findIndex((e) => e.id === id);
    if (expenseIndex === -1) {
      return { success: false, error: "Expense not found" };
    }

    const existingExpense = expenses[expenseIndex];

    // Check if expense is already settled
    if (existingExpense.isSettled) {
      return { success: false, error: "Cannot edit settled expense" };
    }

    // Fetch members to validate participant IDs if participants are being updated
    if (validated.participants) {
      const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];

      // Validate all participants are active members
      for (const participant of validated.participants) {
        const member = members.find((m) => m.id === participant.memberId && m.isActive);
        if (!member) {
          return {
            success: false,
            error: `Invalid member ID: ${participant.memberId} or member is inactive`,
          };
        }
      }
    }

    // Update expense with new values
    const updatedExpense: Expense = {
      ...existingExpense,
      description: validated.description ?? existingExpense.description,
      amount: validated.amount ?? existingExpense.amount,
      category: validated.category ?? existingExpense.category,
      splitMode: validated.splitMode ?? existingExpense.splitMode,
      participants: validated.participants ?? existingExpense.participants,
      notes: validated.notes !== undefined ? validated.notes : existingExpense.notes,
      datetime: validated.datetime ?? existingExpense.datetime,
      payerId: validated.payerId ?? existingExpense.payerId,
      currency: validated.currency ?? existingExpense.currency,
      updatedAt: new Date(),
    };

    // Update in array
    expenses[expenseIndex] = updatedExpense;
    await storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);

    // Recalculate balances
    const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];
    const balances = calculateBalances(expenses, members);
    await storageAdapter.set(STORAGE_KEYS.BALANCES, balances);

    // Invalidate cache
    revalidatePath("/expenses");
    revalidatePath("/");

    return { success: true, expense: updatedExpense, balances };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

/**
 * Delete an expense (only creator can delete)
 */
export async function deleteExpense(
  id: string,
  memberId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { success: false, error: "Invalid expense ID" };
    }
    if (!uuidRegex.test(memberId)) {
      return { success: false, error: "Invalid member ID" };
    }

    // Fetch expenses
    const expenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];

    // Find expense by ID
    const expenseIndex = expenses.findIndex((e) => e.id === id);
    if (expenseIndex === -1) {
      return { success: false, error: "Expense not found" };
    }

    const expense = expenses[expenseIndex];

    // Check if member is the creator
    if (expense.createdBy !== memberId) {
      return { success: false, error: "Only creator can delete expense" };
    }

    // Remove expense from array
    expenses.splice(expenseIndex, 1);
    await storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);

    // Recalculate balances
    const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];
    const balances = calculateBalances(expenses, members);
    await storageAdapter.set(STORAGE_KEYS.BALANCES, balances);

    // Invalidate cache
    revalidatePath("/expenses");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

/**
 * Settle an expense
 * Marks expense as settled and recalculates balances
 */
export async function settleExpense(
  input: unknown
): Promise<
  { success: true; expense: Expense; balances: Balance[] } | { success: false; error: string }
> {
  try {
    // Validate input with Zod schema
    const validated = settleExpenseSchema.parse(input);

    // Fetch expenses
    const expenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];

    // Find expense by ID
    const expenseIndex = expenses.findIndex((e) => e.id === validated.expenseId);
    if (expenseIndex === -1) {
      return { success: false, error: "Expense not found" };
    }

    const expense = expenses[expenseIndex];

    // Check if already settled
    if (expense.isSettled) {
      return { success: false, error: "Expense already settled" };
    }

    // Mark as settled
    const settledExpense: Expense = {
      ...expense,
      isSettled: true,
      settledAt: new Date(),
      updatedAt: new Date(),
    };

    // Update in array
    expenses[expenseIndex] = settledExpense;
    await storageAdapter.set(STORAGE_KEYS.EXPENSES, expenses);

    // Recalculate balances (settled expenses are filtered out)
    const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];
    const balances = calculateBalances(expenses, members);
    await storageAdapter.set(STORAGE_KEYS.BALANCES, balances);

    // Invalidate cache
    revalidatePath("/expenses");
    revalidatePath("/");

    return { success: true, expense: settledExpense, balances };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

/**
 * Recalculate all balances from unsettled expenses
 * Admin utility function for balance reconciliation
 */
export async function recalculateBalances(): Promise<
  { success: true; balances: Balance[] } | { success: false; error: string }
> {
  try {
    // Fetch expenses and members
    const expenses = (await storageAdapter.get<Expense[]>(STORAGE_KEYS.EXPENSES)) || [];
    const members = (await storageAdapter.get<Member[]>(STORAGE_KEYS.MEMBERS)) || [];

    // Recalculate balances from scratch
    const balances = calculateBalances(expenses, members);
    await storageAdapter.set(STORAGE_KEYS.BALANCES, balances);

    // Invalidate cache
    revalidatePath("/");

    return { success: true, balances };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: `Failed to recalculate balances: ${error.message}` };
    }
    return { success: false, error: "Failed to recalculate balances" };
  }
}

export async function getBalances(): Promise<Balance[]> {
  const balances = (await storageAdapter.get<Balance[]>(STORAGE_KEYS.BALANCES)) || [];

  return balances.map((balance) => ({
    ...balance,
    amount: Number(balance.amount.toFixed(2)),
  }));
}
