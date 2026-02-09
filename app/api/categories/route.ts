import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { createCategorySchema, parseBody } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleApiError(error, "Failed to get categories");
  }
}

// POST /api/categories - Create a new category
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

    const parsed = parseBody(createCategorySchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const category = await createCategory(parsed.data.name);

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create category");
  }
}
