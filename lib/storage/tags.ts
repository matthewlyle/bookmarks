import { eq, asc, and } from "drizzle-orm";
import { db } from "../db";
import { tags, bookmarkTags } from "../db/schema";
import type { Tag } from "../types";
import { NotFoundError, ValidationError, DatabaseError } from "../errors";
import { getTagsForBookmark } from "./utils";

// Get all tags
export async function getTags(): Promise<Tag[]> {
  return db.select().from(tags).orderBy(asc(tags.name));
}

// Create a new tag
export async function createTag(name: string): Promise<Tag> {
  const normalized = name.trim().toLowerCase();
  if (!normalized) {
    throw new ValidationError("Tag name cannot be empty");
  }

  try {
    const [tag] = await db
      .insert(tags)
      .values({ id: crypto.randomUUID(), name: normalized })
      .returning();
    return tag;
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new ValidationError("A tag with this name already exists");
    }
    throw new DatabaseError("Failed to create tag", error instanceof Error ? error : undefined);
  }
}

// Delete a tag
export async function deleteTag(id: string): Promise<void> {
  const result = await db.delete(tags).where(eq(tags.id, id));
  if (result.rowsAffected === 0) {
    throw new NotFoundError("Tag", id);
  }
}

// Add a tag to a bookmark
export async function addTagToBookmark(bookmarkId: string, tagId: string): Promise<void> {
  try {
    await db.insert(bookmarkTags).values({ bookmarkId, tagId }).onConflictDoNothing();
  } catch (error) {
    throw new DatabaseError(
      "Failed to add tag to bookmark",
      error instanceof Error ? error : undefined
    );
  }
}

// Remove a tag from a bookmark
export async function removeTagFromBookmark(bookmarkId: string, tagId: string): Promise<void> {
  await db
    .delete(bookmarkTags)
    .where(and(eq(bookmarkTags.bookmarkId, bookmarkId), eq(bookmarkTags.tagId, tagId)));
}

// Set all tags for a bookmark (replace existing)
export async function setBookmarkTags(bookmarkId: string, tagIds: string[]): Promise<Tag[]> {
  await db.transaction(async (tx) => {
    // Remove all existing tags
    await tx.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, bookmarkId));

    // Add new tags
    if (tagIds.length > 0) {
      await tx
        .insert(bookmarkTags)
        .values(tagIds.map((tagId) => ({ bookmarkId, tagId })));
    }
  });

  return getTagsForBookmark(bookmarkId);
}
