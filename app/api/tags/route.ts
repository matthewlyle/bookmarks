import { NextResponse } from "next/server";
import { getTags, createTag } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { createTagSchema, parseBody } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// GET /api/tags - Get all tags
export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json({ data: tags });
  } catch (error) {
    return handleApiError(error, "Failed to get tags");
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseBody(createTagSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const tag = await createTag(parsed.data.name);

    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create tag");
  }
}
