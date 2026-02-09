"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ShareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"saving" | "success" | "error">("saving");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function saveBookmark() {
      const url = searchParams.get("url") || searchParams.get("text");
      const title = searchParams.get("title");

      if (!url) {
        setStatus("error");
        setError("No URL provided");
        return;
      }

      // Extract URL from text if it contains more than just a URL
      let cleanUrl = url;
      const urlMatch = url.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        cleanUrl = urlMatch[0];
      }

      try {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: cleanUrl,
            title: title || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to save bookmark");
        }

        setStatus("success");
        // Redirect to home after short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    }

    saveBookmark();
  }, [searchParams, router]);

  return (
    <div className="text-center space-y-4">
      {status === "saving" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-foreground">Saving bookmark...</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="text-4xl">✓</div>
          <p className="text-foreground font-medium">Bookmarked!</p>
          <p className="text-sm text-foreground">Redirecting...</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl text-red-500">✗</div>
          <p className="text-foreground font-medium">Failed to save</p>
          <p className="text-sm text-foreground">{error}</p>
          <Button
            onClick={() => router.push("/")}
            className="mt-4"
          >
            Go to Bookmarks
          </Button>
        </>
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-foreground">Loading...</p>
          </div>
        }
      >
        <ShareContent />
      </Suspense>
    </div>
  );
}
