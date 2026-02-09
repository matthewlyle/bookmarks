import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Requires a valid session or API key for write operations.
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await auth();
  if (session) return null;

  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");
  if (apiKey === process.env.API_SECRET_KEY) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
