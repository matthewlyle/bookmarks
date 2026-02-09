"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { deleteBookmark, updateBookmark } from "@/lib/api";
import type { Bookmark } from "@/lib/types";
import { UNDO_DELAY_MS } from "@/lib/constants";

interface UseBookmarkActionsOptions {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onUpdate?: (bookmark: Bookmark) => void;
}

interface UseBookmarkActionsReturn {
  handleDelete: (e?: React.MouseEvent | Event) => void;
  handleToggleRead: (e?: React.MouseEvent | Event) => Promise<void>;
  handleSaveEdit: (
    bookmarkId: string,
    data: { title: string; categoryId: string | null }
  ) => Promise<void>;
}

export function useBookmarkActions({
  bookmark,
  onDelete,
  onUpdate,
}: UseBookmarkActionsOptions): UseBookmarkActionsReturn {
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDelete = useCallback(
    (e?: React.MouseEvent | Event) => {
      if (e && "preventDefault" in e) {
        e.preventDefault();
      }
      if (e && "stopPropagation" in e) {
        (e as React.MouseEvent).stopPropagation();
      }

      onDelete(bookmark.id);

      let deleted = false;
      deleteTimeoutRef.current = setTimeout(async () => {
        try {
          await deleteBookmark(bookmark.id);
          deleted = true;
        } catch (error) {
          onUpdate?.(bookmark);
          toast.error("Failed to delete bookmark", {
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }, UNDO_DELAY_MS);

      toast.success("Bookmark deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            if (!deleted && deleteTimeoutRef.current) {
              clearTimeout(deleteTimeoutRef.current);
              onUpdate?.(bookmark);
            }
          },
        },
      });
    },
    [bookmark, onDelete, onUpdate]
  );

  const handleToggleRead = useCallback(
    async (e?: React.MouseEvent | Event) => {
      if (e && "preventDefault" in e) e.preventDefault();
      if (e && "stopPropagation" in e) (e as React.MouseEvent).stopPropagation();
      try {
        const updatedBookmark = await updateBookmark(bookmark.id, {
          read: !bookmark.read,
        });
        onUpdate?.(updatedBookmark);
        toast.success(updatedBookmark.read ? "Marked as read" : "Marked as unread");
      } catch (error) {
        toast.error("Failed to update bookmark", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [bookmark?.id, bookmark?.read, onUpdate]
  );

  const handleSaveEdit = useCallback(
    async (
      bookmarkId: string,
      data: { title: string; categoryId: string | null }
    ) => {
      try {
        const updatedBookmark = await updateBookmark(bookmarkId, data);
        onUpdate?.(updatedBookmark);
        toast.success("Bookmark updated");
      } catch (error) {
        toast.error("Failed to update bookmark", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    [onUpdate]
  );

  return {
    handleDelete,
    handleToggleRead,
    handleSaveEdit,
  };
}
