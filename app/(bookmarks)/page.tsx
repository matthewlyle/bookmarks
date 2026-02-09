"use client";

import { useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Search, X } from "lucide-react";
import { BookmarkList } from "@/components/bookmark";
import SideNav from "@/components/SideNav";
import { useBookmarks, useCategories } from "@/lib/hooks";
import { useSearch } from "@/lib/SearchContext";
import type { Bookmark } from "@/lib/types";

const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export default function Home() {
  const { bookmarks, isLoading: bookmarksLoading, mutate } = useBookmarks();
  const { isLoading: categoriesLoading } = useCategories();
  const { searchQuery, setSearchQuery, clearSearch, isSearching, selectedCategoryId } = useSearch();

  const isLoading = categoriesLoading || bookmarksLoading;

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (selectedCategoryId) {
      filtered = filtered.filter((bookmark: Bookmark) => 
        bookmark.category?.id === selectedCategoryId
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bookmark: Bookmark) =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [bookmarks, searchQuery, selectedCategoryId]);

  const handleBookmarkDelete = useCallback(
    (id: string) => {
      mutate(
        (data: Bookmark[] | undefined) => (data ? data.filter((b) => b.id !== id) : data),
        { revalidate: false }
      );
    },
    [mutate]
  );

  const handleBookmarkUpdate = useCallback(
    (updatedBookmark: Bookmark) => {
      mutate(
        (data: Bookmark[] | undefined) =>
          data
            ? data.map((b) => (b.id === updatedBookmark.id ? updatedBookmark : b))
            : data,
        { revalidate: true }
      );
    },
    [mutate]
  );

  return (
    <div className="py-8 px-4 min-h-[200px]">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center py-24"
          >
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            {...FADE_IN}
            className="bookmark-page-content space-y-6"
          >
            <div className="search-bar relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-10 text-sm bg-background border border-input text-foreground placeholder:text-foreground transition-[color,background-color,border-color,box-shadow] duration-200 ease focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background"
              />
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={clearSearch}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="absolute right-7 md:right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground transition-colors duration-200 ease"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>
            <div className="flex gap-8">
              <SideNav />
              <div className="flex-1 min-w-0 pb-16 overflow-hidden">
                <BookmarkList
                  bookmarks={filteredBookmarks}
                  isLoading={false}
                  emptyMessage={
                    isSearching
                      ? "No bookmarks match your search."
                      : selectedCategoryId
                        ? "No bookmarks in this category."
                        : "No bookmarks."
                  }
                  onDelete={handleBookmarkDelete}
                  onUpdate={handleBookmarkUpdate}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
