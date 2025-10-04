"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold">You are offline</h1>
        <p className="text-muted-foreground">
          It looks like your device lost its connection. You can keep viewing cached pages and your
          latest data. Once you are back online everything will sync automatically.
        </p>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition hover:bg-primary/90"
          onClick={() => window.location.reload()}
        >
          Retry connection
        </button>
      </div>
    </div>
  );
}
