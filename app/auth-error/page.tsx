import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-card">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-primary">Access Denied</h1>
        <p className="mt-2 text-foreground">
          This app is restricted to authorized users only.
        </p>
        <Button size="lg" className="mt-6 rounded-none" asChild>
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
