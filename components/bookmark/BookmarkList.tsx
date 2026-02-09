"use client";

import { motion } from "motion/react";
import BookmarkItem from "./Bookmark";
import type { Bookmark } from "@/lib/types";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  emptyMessage?: string;
  onDelete: (id: string) => void;
  onUpdate: (bookmark: Bookmark) => void;
}

export default function BookmarkList({
  bookmarks,
  isLoading,
  emptyMessage = "No bookmarks.",
  onDelete,
  onUpdate,
}: BookmarkListProps) {
  const animationProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  if (isLoading && bookmarks.length === 0) {
    return <motion.div className="py-12" {...animationProps} />;
  }

  if (bookmarks.length === 0) {
    return (
      <motion.p className="text-foreground" {...animationProps}>
        {emptyMessage}
      </motion.p>
    );
  }

  return (
    <motion.div className="bookmark-list flex flex-col gap-3" {...animationProps}>
      {bookmarks.filter((b): b is Bookmark => b != null).map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </motion.div>
  );
}
