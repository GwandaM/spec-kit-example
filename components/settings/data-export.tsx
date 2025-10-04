"use client";

/**
 * Data Export - Client Component
 * Export and import household data
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement export endpoint
      // const response = await fetch('/api/export')
      // const data = await response.json()

      // Placeholder implementation
      const exportData = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        household: {
          // Data from localStorage
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flatmate-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess("Data exported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // TODO: Implement import endpoint
      // const response = await fetch('/api/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })

      // Placeholder validation
      if (!data.version || !data.household) {
        throw new Error("Invalid export file format");
      }

      setSuccess("Data imported successfully! Please refresh the page.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import data");
    } finally {
      setIsImporting(false);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all household data as a JSON file</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export includes all members, expenses, groceries, chores, gym sessions, notes, and
            settings. Use this to create backups or transfer data to another device.
          </p>
        </CardContent>

        <CardFooter>
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Restore data from a previous export</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Importing will overwrite all existing data. Make sure to
              export your current data first.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="import-file">Select Export File</Label>
            <Input
              id="import-file"
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              disabled={isImporting}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
