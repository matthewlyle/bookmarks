"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Error</h1>
        <p className="text-lg text-foreground">Something went wrong</p>
        <Button onClick={reset} className="rounded-none">
          Try again
        </Button>
      </div>
    </div>
  );
}
