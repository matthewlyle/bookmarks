import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <p className="text-lg text-foreground">Page not found</p>
        <Button asChild className="rounded-none">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
