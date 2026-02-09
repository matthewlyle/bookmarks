import { NextRequest, NextResponse } from "next/server";
import { renameCategory, deleteCategory } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { renameCategorySchema, parseBody } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// PATCH /api/categories/[slug] - Rename a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseBody(renameCategorySchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const category = await renameCategory(slug, parsed.data.newName);

    return NextResponse.json({ data: category });
  } catch (error) {
    return handleApiError(error, "Failed to rename category");
  }
}

// DELETE /api/categories/[slug] - Delete a category
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { slug } = await params;

    if (!slug || slug.length === 0) {
      return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
    }

    await deleteCategory(slug);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error, "Failed to delete category");
  }
}
