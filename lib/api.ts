import type { Bookmark, Category, Tag } from "./types";

export type { Bookmark, Category, Tag };

const API_BASE_URL = "/api";

export async function getBookmarks(): Promise<Bookmark[]> {
  const response = await fetch(`${API_BASE_URL}/bookmarks`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookmarks");
  }
  const json = await response.json();
  return json.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const json = await response.json();
  return json.data;
}

export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/tags`);
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  const json = await response.json();
  return json.data;
}

export async function createBookmark(
  url: string,
  title?: string,
  categoryId?: string
): Promise<Bookmark> {
  const response = await fetch(`${API_BASE_URL}/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, title, categoryId }),
  });
  if (!response.ok) {
    throw new Error("Failed to create bookmark");
  }
  const json = await response.json();
  return json.data;
}

export async function updateBookmark(
  id: string,
  data: { title?: string; categoryId?: string | null; tagIds?: string[]; read?: boolean }
): Promise<Bookmark> {
  const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update bookmark");
  }
  const json = await response.json();
  return json.data;
}

export async function deleteBookmark(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/bookmarks/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete bookmark");
  }
  const json = await response.json();
  return json.data;
}
