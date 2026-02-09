import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { bookmarks, categories, bookmarkTags } from "../db/schema";
import type { Bookmark, NewBookmarkInput, Tag } from "../types";
import { NotFoundError } from "../errors";
import { getHost, toBookmark, getTagsForBookmark, getTagsForBookmarks, getCategoryById } from "./utils";

export async function getBookmarks(): Promise<Bookmark[]> {
  // Fetch bookmarks with categories in a single JOIN query
  const rows = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .orderBy(desc(bookmarks.createdAt));

  // Batch fetch tags for all bookmarks
  const bookmarkIds = rows.map((r) => r.bookmarks.id);
  const tagsByBookmark = await getTagsForBookmarks(bookmarkIds);

  return rows.map((row) =>
    toBookmark(row, tagsByBookmark.get(row.bookmarks.id) ?? [])
  );
}

export async function createBookmark(
  data: NewBookmarkInput,
  categoryId?: string
): Promise<Bookmark> {
  const bookmarkData = categoryId ? { ...data, categoryId } : data;
  const [bookmark] = await db.insert(bookmarks).values(bookmarkData).returning();

  // Only fetch category if we have a categoryId (avoids extra query when no category)
  const category = categoryId ? await getCategoryById(categoryId) : null;

  return {
    id: bookmark.id,
    url: bookmark.url,
    host: getHost(bookmark.url),
    title: bookmark.title,
    image: bookmark.image,
    category,
    tags: [],
    read: Boolean(bookmark.read),
    createdAt: bookmark.createdAt,
  };
}

export async function findBookmarkByUrl(url: string): Promise<Bookmark | null> {
  const [row] = await db
    .select()
    .from(bookmarks)
    .leftJoin(categories, eq(bookmarks.categoryId, categories.id))
    .where(eq(bookmarks.url, url))
    .limit(1);

  if (!row) return null;

  const bookmarkTagsList = await getTagsForBookmark(row.bookmarks.id);
  return toBookmark(row, bookmarkTagsList);
}

export async function deleteBookmark(id: string): Promise<void> {
  const result = await db.delete(bookmarks).where(eq(bookmarks.id, id));
  if (result.rowsAffected === 0) {
    throw new NotFoundError("Bookmark", id);
  }
}

// Update a bookmark (title, category, tags, and/or read)
export async function updateBookmark(
  id: string,
  data: { title?: string; categoryId?: string | null; tagIds?: string[]; read?: boolean }
): Promise<Bookmark> {
  const { tagIds, ...bookmarkData } = data;

  // Build the update object - only include fields that were provided
  const updateData: { title?: string; categoryId?: string | null; read?: number } = {};
  if (bookmarkData.title !== undefined) {
    updateData.title = bookmarkData.title;
  }
  if (bookmarkData.categoryId !== undefined) {
    updateData.categoryId = bookmarkData.categoryId;
  }
  if (bookmarkData.read !== undefined) {
    updateData.read = bookmarkData.read ? 1 : 0;
  }

  // Update bookmark fields if any were provided
  let bookmark: typeof bookmarks.$inferSelect;
  if (Object.keys(updateData).length > 0) {
    const [updated] = await db
      .update(bookmarks)
      .set(updateData)
      .where(eq(bookmarks.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundError("Bookmark", id);
    }
    bookmark = updated;
  } else {
    // No bookmark fields to update, just fetch current state
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.id, id));

    if (!existing) {
      throw new NotFoundError("Bookmark", id);
    }
    bookmark = existing;
  }

  // Update tags if provided
  if (tagIds !== undefined) {
    await db.transaction(async (tx) => {
      await tx.delete(bookmarkTags).where(eq(bookmarkTags.bookmarkId, id));
      if (tagIds.length > 0) {
        await tx
          .insert(bookmarkTags)
          .values(tagIds.map((tagId) => ({ bookmarkId: id, tagId })));
      }
    });
  }

  // Fetch category and tags for response
  const [category, bookmarkTagsList] = await Promise.all([
    bookmark.categoryId ? getCategoryById(bookmark.categoryId) : null,
    getTagsForBookmark(id),
  ]);

  return {
    id: bookmark.id,
    url: bookmark.url,
    host: getHost(bookmark.url),
    title: bookmark.title,
    image: bookmark.image,
    category,
    tags: bookmarkTagsList,
    read: Boolean(bookmark.read),
    createdAt: bookmark.createdAt,
  };
}
