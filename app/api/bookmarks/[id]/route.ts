import { NextRequest, NextResponse } from "next/server";
import { deleteBookmark, updateBookmark } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { updateBookmarkSchema, uuidSchema, parseBody } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// PATCH /api/bookmarks/[id] - Update a bookmark
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Invalid bookmark ID" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = parseBody(updateBookmarkSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const bookmark = await updateBookmark(id, parsed.data);

    return NextResponse.json({ data: bookmark });
  } catch (error) {
    return handleApiError(error, "Failed to update bookmark");
  }
}

// DELETE /api/bookmarks/[id] - Delete a bookmark
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Invalid bookmark ID" }, { status: 400 });
    }

    await deleteBookmark(id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error, "Failed to delete bookmark");
  }
}
