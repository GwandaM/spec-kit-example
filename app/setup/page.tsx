import { Wizard } from "@/components/setup/wizard";

export default function SetupPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome to Flatmate Life</h1>
        <p className="text-muted-foreground mt-2">Let&apos;s get your household set up</p>
      </div>

      <Wizard />
    </div>
  );
}
