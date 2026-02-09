import type { Tag } from "../types";
import { db } from "../db";
import { tags, bookmarkTags, categories } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

// Generate a URL-safe slug from a name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Extract hostname from URL (without www.)
export function getHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Transform JOIN result to Bookmark
export function toBookmark(
  row: {
    bookmarks: typeof import("../db/schema").bookmarks.$inferSelect;
    categories: typeof categories.$inferSelect | null;
  },
  bookmarkTags: Tag[] = []
) {
  return {
    id: row.bookmarks.id,
    url: row.bookmarks.url,
    host: getHost(row.bookmarks.url),
    title: row.bookmarks.title,
    image: row.bookmarks.image,
    category: row.categories,
    tags: bookmarkTags,
    read: Boolean(row.bookmarks.read),
    createdAt: row.bookmarks.createdAt,
  };
}

// Get tags for a specific bookmark
export async function getTagsForBookmark(bookmarkId: string): Promise<Tag[]> {
  const rows = await db
    .select({ tag: tags })
    .from(bookmarkTags)
    .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(eq(bookmarkTags.bookmarkId, bookmarkId));
  return rows.map((r) => r.tag);
}

// Get tags for multiple bookmarks (batch query)
export async function getTagsForBookmarks(
  bookmarkIds: string[]
): Promise<Map<string, Tag[]>> {
  if (bookmarkIds.length === 0) return new Map();

  const rows = await db
    .select({ bookmarkId: bookmarkTags.bookmarkId, tag: tags })
    .from(bookmarkTags)
    .innerJoin(tags, eq(bookmarkTags.tagId, tags.id))
    .where(inArray(bookmarkTags.bookmarkId, bookmarkIds));

  const tagsByBookmark = new Map<string, Tag[]>();
  for (const row of rows) {
    const existing = tagsByBookmark.get(row.bookmarkId) ?? [];
    existing.push(row.tag);
    tagsByBookmark.set(row.bookmarkId, existing);
  }
  return tagsByBookmark;
}

export async function getCategoryById(id: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));
  return category ?? null;
}
