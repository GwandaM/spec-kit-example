import { HouseholdNavigation } from "@/components/shared/nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HouseholdNavigation />
      <main className="pb-20 md:pb-0 md:pl-64">{children}</main>
    </div>
  );
}
