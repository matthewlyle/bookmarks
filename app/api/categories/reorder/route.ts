import { NextRequest, NextResponse } from "next/server";
import { reorderCategories } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { reorderCategoriesSchema, parseBody } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// PUT /api/categories/reorder - Reorder categories
export async function PUT(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseBody(reorderCategoriesSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await reorderCategories(parsed.data.orderedIds);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error, "Failed to reorder categories");
  }
}
