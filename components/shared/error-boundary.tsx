"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught an error", error, info);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallbackMessage } = this.props;

    if (!hasError) {
      return children;
    }

    return (
      <Card className="flex flex-col items-center justify-center gap-4 border border-destructive/40 bg-destructive/5 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {fallbackMessage ?? "Please try again or refresh the page."}
          </p>
          {error?.message ? (
            <p className="text-xs text-muted-foreground/80">Details: {error.message}</p>
          ) : null}
        </div>
        <Button variant="secondary" onClick={this.handleRetry}>
          Try again
        </Button>
      </Card>
    );
  }
}

export function withErrorBoundary<P extends object>(
  ComponentWithBoundary: (props: P) => ReactNode,
  options: Omit<ErrorBoundaryProps, "children"> = {}
) {
  return function WrappedComponent(props: P): ReactNode {
    return (
      <ErrorBoundary fallbackMessage={options.fallbackMessage} onRetry={options.onRetry}>
        <ComponentWithBoundary {...props} />
      </ErrorBoundary>
    );
  };
}
