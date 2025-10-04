"use client";

/**
 * Setup Wizard - Client Component
 * Multi-step first-run setup wizard
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setupPin } from "@/src/server/actions/auth";
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Household Details", description: "Basic information" },
  { id: 2, title: "Add Members", description: "Who lives here?" },
  { id: 3, title: "Set PIN", description: "Secure your data" },
  { id: 4, title: "Categories", description: "Customize your setup" },
];

export function SetupWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Household Details
  const [householdName, setHouseholdName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [locale, setLocale] = useState("en-US");

  // Step 2: Members
  const [members, setMembers] = useState([
    { name: "", color: "#" + Math.floor(Math.random() * 16777215).toString(16), shareRatio: 1.0 },
  ]);

  // Step 3: PIN
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinHint, setPinHint] = useState("");

  // Step 4: Categories
  const [expenseCategories, setExpenseCategories] = useState([
    "Bills",
    "Groceries",
    "Takeout",
    "Entertainment",
    "Other",
  ]);
  const [groceryCategories, setGroceryCategories] = useState([
    "Dairy",
    "Produce",
    "Meat",
    "Snacks",
    "Beverages",
  ]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    setError(null);

    if (currentStep === 1) {
      if (!householdName.trim()) {
        setError("Please enter a household name");
        return;
      }
    }

    if (currentStep === 2) {
      const validMembers = members.filter((m) => m.name.trim());
      if (validMembers.length === 0) {
        setError("Please add at least one member");
        return;
      }
    }

    if (currentStep === 3) {
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match");
        return;
      }

      // Setup PIN
      startTransition(async () => {
        const result = await setupPin({
          pin,
          hint: pinHint || undefined,
        });

        if (!result.success) {
          setError(result.error || "Failed to setup PIN");
          return;
        }

        setCurrentStep(4);
      });
      return;
    }

    if (currentStep === 4) {
      // Complete setup
      startTransition(async () => {
        // TODO: Save household details, members, and categories
        // For now, just redirect
        router.push("/");
      });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const addMember = () => {
    setMembers([
      ...members,
      { name: "", color: "#" + Math.floor(Math.random() * 16777215).toString(16), shareRatio: 1.0 },
    ]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Setup Wizard</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Household Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="householdName">Household Name</Label>
                <Input
                  id="householdName"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="The Smiths, Apt 42, etc."
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Input
                    id="locale"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    placeholder="en-US"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Members */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`member-${index}`}>Member {index + 1}</Label>
                    <Input
                      id={`member-${index}`}
                      value={member.name}
                      onChange={(e) => updateMember(index, "name", e.target.value)}
                      placeholder="Name"
                      maxLength={50}
                    />
                  </div>

                  <Input
                    type="color"
                    value={member.color}
                    onChange={(e) => updateMember(index, "color", e.target.value)}
                    className="w-16 h-10"
                  />

                  {members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMember(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMember}
                className="w-full"
                disabled={members.length >= 12}
              >
                Add Another Member
              </Button>
            </div>
          )}

          {/* Step 3: Set PIN */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN (4-6 digits)</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinHint">PIN Hint (optional)</Label>
                <Input
                  id="pinHint"
                  value={pinHint}
                  onChange={(e) => setPinHint(e.target.value)}
                  placeholder="My birthday, etc."
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Step 4: Categories */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Expense Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map((cat, idx) => (
                    <div key={idx} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Grocery Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {groceryCategories.map((cat, idx) => (
                    <div key={idx} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {cat}
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>You can customize categories later in Settings.</AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isPending}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext} disabled={isPending}>
            {isPending ? (
              "Setting up..."
            ) : currentStep === STEPS.length ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
