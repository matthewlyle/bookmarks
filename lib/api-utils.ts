import { NextResponse } from "next/server";
import { AppError, NotFoundError, ValidationError, DatabaseError } from "./errors";

/**
 * Converts an error to an appropriate HTTP response.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);

  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error instanceof DatabaseError) {
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json({ error: message }, { status: 500 });
}
