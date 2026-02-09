"use client";

import useSWRImmutable from "swr/immutable";
import { mutate } from "swr";
import type { Bookmark, Category, Tag } from "./types";

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json = await res.json();
  return json.data;
};

/** Fetches all bookmarks, filters client-side by category slug */
export function useBookmarks(categorySlug?: string) {
  const {
    data,
    error,
    isLoading,
    mutate: boundMutate,
  } = useSWRImmutable<Bookmark[]>("/api/bookmarks", fetcher);

  const allBookmarks: Bookmark[] = data ?? [];
  const bookmarks: Bookmark[] = categorySlug
    ? allBookmarks.filter((b) => b.category?.slug === categorySlug)
    : allBookmarks;

  return {
    bookmarks,
    isLoading,
    error,
    mutate: boundMutate,
  };
}

/** Fetches all categories */
export function useCategories() {
  const { data, error, isLoading, mutate: boundMutate } = useSWRImmutable<Category[]>(
    "/api/categories",
    fetcher
  );

  const categories: Category[] = data ?? [];

  return {
    categories,
    isLoading,
    error,
    mutate: boundMutate,
  };
}

/** Fetches all tags */
export function useTags() {
  const { data, error, isLoading, mutate: boundMutate } = useSWRImmutable<Tag[]>(
    "/api/tags",
    fetcher
  );

  return {
    tags: data ?? [],
    isLoading,
    error,
    mutate: boundMutate,
  };
}

/** Refetch all data after a mutation */
export async function refetchData() {
  await Promise.all([
    mutate("/api/bookmarks"),
    mutate("/api/categories"),
    mutate("/api/tags"),
  ]);
}
