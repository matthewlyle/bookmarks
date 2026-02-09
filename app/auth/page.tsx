"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-card">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-primary">Bookmarks</h1>
        <Button
          size="lg"
          className="mt-6 rounded-none"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
