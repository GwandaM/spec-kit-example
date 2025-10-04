"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { addGrocerySchema, type AddGroceryInput } from "@/src/server/validators/grocery.schema";

interface GroceryFormMember {
  id: string;
  name: string;
}

interface GroceryFormProps {
  members: GroceryFormMember[];
  defaultCategory?: string;
  onSubmit?: (values: AddGroceryInput) => Promise<void>;
}

const CATEGORIES = ["Produce", "Dairy", "Household", "Snacks", "Other"];

export function GroceryForm({ members, defaultCategory = "Produce", onSubmit }: GroceryFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<AddGroceryInput>({
    resolver: zodResolver(addGrocerySchema),
    defaultValues: {
      name: "",
      quantity: null,
      unit: null,
      cost: 0,
      category: defaultCategory,
      addedBy: members[0]?.id ?? "",
      purchasedAt: new Date(),
    },
  });

  const handleSubmit = (values: AddGroceryInput) => {
    if (!onSubmit) {
      return;
    }

    startTransition(async () => {
      await onSubmit({
        ...values,
        cost: Number(values.cost.toFixed(2)),
      });
    });
  };

  return (
    <Card className="border p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Almond milk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === "" ? null : event.target.valueAsNumber
                        )
                      }
                      placeholder="e.g. 2"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional quantity (leave empty if not applicable).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="kg, pcs, pack"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
            control={form.control}
            name="purchasedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchased on</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value.toISOString().slice(0, 10)}
                    onChange={(event) => field.onChange(new Date(event.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchased by</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
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

          <div className="flex items-center justify-end gap-3">
            <Button
              type="reset"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending || !members.length}>
              {isPending ? "Saving…" : "Add item"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
