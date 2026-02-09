"use client";

import React, { useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Trash2, Pencil, Copy, BookCheck, Bookmark as BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteBookmark, updateBookmark } from "@/lib/api";
import { UNDO_DELAY_MS } from "@/lib/constants";
import EditBookmarkDialog from "@/components/EditBookmarkDialog";
import SwipeableRow, { type SwipeableRowHandle } from "./SwipeableRow";
import BookmarkContent from "./BookmarkContent";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Bookmark as BookmarkType } from "@/lib/types";

interface BookmarkProps {
  bookmark: BookmarkType;
  onDelete: (id: string) => void;
  onUpdate?: (bookmark: BookmarkType) => void;
}

export default function Bookmark({ bookmark, onDelete, onUpdate }: BookmarkProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const swipeRef = useRef<SwipeableRowHandle>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDelete = useCallback(
    (e?: React.MouseEvent | Event) => {
      if (e && "preventDefault" in e) e.preventDefault();
      if (e && "stopPropagation" in e) (e as React.MouseEvent).stopPropagation();

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

  const handleToggleRead = useCallback(async () => {
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
  }, [bookmark.id, bookmark.read, onUpdate]);

  const handleSaveEdit = useCallback(
    async (bookmarkId: string, data: { title: string; categoryId: string | null }) => {
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

  const handleEdit = useCallback(() => {
    swipeRef.current?.closeSwipe();
    setIsEditDialogOpen(true);
  }, []);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  }, [bookmark.url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isAuthenticated) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleEdit();
      }
    },
    [handleEdit, isAuthenticated]
  );

  const { url, host, title, image, createdAt } = bookmark;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="relative"
          role="article"
          aria-label={`Bookmark: ${title}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {isAuthenticated ? (
            <SwipeableRow
              ref={swipeRef}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleRead={handleToggleRead}
              isRead={!!bookmark.read}
            >
              <BookmarkContent
                url={url}
                host={host}
                title={title}
                image={image}
                createdAt={createdAt}
              />
            </SwipeableRow>
          ) : (
            <BookmarkContent
              url={url}
              host={host}
              title={title}
              image={image}
              createdAt={createdAt}
            />
          )}

          <EditBookmarkDialog
            bookmark={bookmark}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleSaveEdit}
          />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={handleCopyUrl}>
          <Copy className="h-4 w-4" />
          Copy URL
        </ContextMenuItem>
        {isAuthenticated && (
          <>
            {bookmark.read ? (
              <ContextMenuItem onClick={handleToggleRead}>
                <BookmarkIcon className="h-4 w-4" />
                Mark as unread
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={handleToggleRead}>
                <BookCheck className="h-4 w-4" />
                Mark as read
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem destructive onClick={() => handleDelete()}>
              <Trash2 className="h-4 w-4" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
