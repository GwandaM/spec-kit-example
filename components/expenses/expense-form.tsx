"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateExpenseInput } from "@/src/server/validators/expense.schema";
import { createExpenseSchema } from "@/src/server/validators/expense.schema";
import type { Expense } from "@/lib/types/entities";

interface ExpenseFormMember {
  id: string;
  name: string;
  shareRatio: number;
}

const CATEGORY_OPTIONS = ["Bills", "Groceries", "Takeout", "Entertainment", "Other"];
const SPLIT_MODES = [
  { value: "equal", label: "Equal split" },
  { value: "ratio", label: "Share ratio" },
  { value: "custom", label: "Custom amounts" },
] as const;

export interface ExpenseFormProps {
  members: ExpenseFormMember[];
  currentMemberId: string;
  defaultCurrency?: string;
  defaultValues?: Partial<CreateExpenseInput>;
  onSubmit?: (values: CreateExpenseInput) => Promise<void>;
  onSuccess?: (expense: Expense) => void;
}

const clampAmount = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(2));
};

export function ExpenseForm({
  members,
  currentMemberId,
  defaultCurrency = "USD",
  defaultValues,
  onSubmit,
}: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const form = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onSubmit",
    defaultValues: {
      description: "",
      amount: 0,
      currency: defaultCurrency,
      category: CATEGORY_OPTIONS[0] ?? "Other",
      payerId: members[0]?.id ?? "",
      splitMode: "equal",
      participants: [],
      notes: "",
      datetime: new Date(),
      createdBy: currentMemberId,
      ...defaultValues,
    },
  });

  const { control, watch, setValue, getValues } = form;
  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: "participants",
    keyName: "fieldId",
  });

  const payerId = watch("payerId");
  const splitMode = watch("splitMode");
  const amount = watch("amount") || 0;

  const ensureParticipant = (memberId: string) => {
    const current = getValues("participants");
    const index = current.findIndex((participant) => participant.memberId === memberId);
    if (index === -1) {
      append({ memberId, amount: 0, percentage: null });
    }
  };

  useEffect(() => {
    if (!members.length) {
      return;
    }

    const initialParticipants = members
      .filter((member) => member.id === payerId || member.id === currentMemberId)
      .map((member) => ({ memberId: member.id, amount: 0, percentage: null }));

    if (!initialParticipants.length) {
      initialParticipants.push({ memberId: payerId || members[0].id, amount: 0, percentage: null });
    }

    replace(initialParticipants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  useEffect(() => {
    if (!payerId) return;
    ensureParticipant(payerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payerId]);

  const toggleParticipant = (memberId: string) => {
    const current = getValues("participants");
    const index = current.findIndex((participant) => participant.memberId === memberId);

    if (index === -1) {
      append({ memberId, amount: 0, percentage: null });
      return;
    }

    if (memberId === payerId) {
      return;
    }

    remove(index);
  };

  const recalculateShares = () => {
    const current = getValues("participants");
    if (!current.length) return;

    const total = amount || 0;

    if (splitMode === "custom") {
      return;
    }

    if (splitMode === "equal") {
      const share = current.length ? clampAmount(total / current.length) : 0;
      current.forEach((participant, index) => {
        update(index, { ...participant, amount: share, percentage: null });
      });
      return;
    }

    if (splitMode === "ratio") {
      const ratios = current.map(
        (participant) => memberMap.get(participant.memberId)?.shareRatio ?? 0
      );
      const ratioSum = ratios.reduce((sum, ratio) => sum + ratio, 0);
      const normalized = ratioSum > 0 ? ratios : ratios.map(() => 1);
      const normalizedSum = normalized.reduce((sum, ratio) => sum + ratio, 0);

      current.forEach((participant, index) => {
        const allocation = normalized[index] / normalizedSum;
        const amountShare = clampAmount(total * allocation);
        update(index, { ...participant, amount: amountShare, percentage: allocation * 100 });
      });
    }
  };

  useEffect(() => {
    recalculateShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMode, amount, fields.length]);

  const handleSubmit = (values: CreateExpenseInput) => {
    if (!onSubmit) {
      return;
    }

    startTransition(async () => {
      await onSubmit({
        ...values,
        participants: values.participants.map((participant) => ({
          ...participant,
          amount: clampAmount(participant.amount),
          percentage: participant.percentage === null ? null : clampAmount(participant.percentage),
        })),
      });
    });
  };

  return (
    <Card className="border p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Utilities Bill" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={new Date(field.value).toISOString().slice(0, 16)}
                      onChange={(event) => field.onChange(new Date(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="payerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payer</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add additional context (optional)" {...field} />
                </FormControl>
                <FormDescription>Optional details visible to all flatmates.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="splitMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split method</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select split" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPLIT_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Choose how the amount should be distributed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Participants</h3>
              <p className="text-sm text-muted-foreground">Select who shares this expense.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isSelected = fields.some((participant) => participant.memberId === member.id);
                return (
                  <Button
                    key={member.id}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleParticipant(member.id)}
                    aria-pressed={isSelected}
                  >
                    {member.name}
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2">
              {fields.map((participant, index) => {
                const member = memberMap.get(participant.memberId);
                if (!member) return null;

                return (
                  <Card
                    key={participant.fieldId}
                    className="flex flex-col gap-3 border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Share ratio: {Math.round((member.shareRatio || 0) * 100)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.watch(`participants.${index}.amount`)}
                        onChange={(event) =>
                          setValue(
                            `participants.${index}.amount`,
                            event.target.valueAsNumber || 0,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          )
                        }
                        disabled={splitMode !== "custom"}
                        className="w-28"
                        aria-label={`${member.name} amount`}
                      />
                      {splitMode === "custom" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (participant.memberId === payerId) return;
                            remove(index);
                          }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending || !fields.length}>
              {isPending ? "Saving…" : "Save expense"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
