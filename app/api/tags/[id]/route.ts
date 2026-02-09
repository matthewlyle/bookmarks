import { NextRequest, NextResponse } from "next/server";
import { deleteTag } from "@/lib/storage";
import { requireAuth } from "@/lib/require-auth";
import { uuidSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api-utils";

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;

    if (!uuidSchema.safeParse(id).success) {
      return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
    }

    await deleteTag(id);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error, "Failed to delete tag");
  }
}
