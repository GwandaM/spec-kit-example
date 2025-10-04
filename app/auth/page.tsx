import { PinEntry } from "@/components/auth/pin-entry";

export default function AuthPage() {
  return (
    <div className="container mx-auto p-6 max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Enter your PIN to access the app</p>
      </div>

      <PinEntry />
    </div>
  );
}
