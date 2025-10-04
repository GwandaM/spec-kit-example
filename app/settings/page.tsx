import { MemberManager } from "@/components/settings/member-manager";
import { DataExport } from "@/components/settings/data-export";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage household settings and data</p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <MemberManager />
        </TabsContent>
        <TabsContent value="general" className="space-y-4">
          <p className="text-muted-foreground">General settings coming soon</p>
        </TabsContent>
        <TabsContent value="data" className="space-y-4">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
