"use client";

import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { Trash2, Pencil, Copy, BookCheck, Bookmark as BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { SWIPE, SPRING_BOUNCY } from "@/lib/constants";
import { friendlyDate } from "@/lib/utils";
import { useBookmarkActions } from "@/hooks/useBookmarkActions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import EditBookmarkDialog from "@/components/EditBookmarkDialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Bookmark } from "@/lib/types";

interface BookmarkProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  onUpdate?: (bookmark: Bookmark) => void;
}

export default function Bookmark({ bookmark, onDelete, onUpdate }: BookmarkProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { handleDelete, handleToggleRead, handleSaveEdit } = useBookmarkActions({
    bookmark,
    onDelete,
    onUpdate,
  });

  const {
    x,
    isDeleting,
    leftButtonsRevealed,
    rightButtonsRevealed,
    buttonsOpacity,
    buttonsScale,
    rightButtonsOpacity,
    rightButtonsScale,
    closeSwipe,
    bind,
    handleLinkClick,
  } = useSwipeGesture({ onDelete: handleDelete });

  const handleEdit = useCallback(
    (e?: React.MouseEvent | Event) => {
      if (e && "preventDefault" in e) {
        e.preventDefault();
      }
      if (e && "stopPropagation" in e) {
        (e as React.MouseEvent).stopPropagation();
      }
      closeSwipe();
      setIsEditDialogOpen(true);
    },
    [closeSwipe]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isAuthenticated) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        handleEdit();
      }
    },
    [handleEdit, isAuthenticated]
  );

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  }, [bookmark.url]);

  const handleToggleReadClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      closeSwipe();
      handleToggleRead(e);
    },
    [closeSwipe, handleToggleRead]
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
          {isAuthenticated && (
            <>
              <motion.div
                className="absolute left-0 top-0 bottom-0 flex w-[72px] pr-3"
                style={{
                  opacity: rightButtonsOpacity,
                  scale: rightButtonsScale,
                  pointerEvents: leftButtonsRevealed ? "auto" : "none",
                }}
                aria-hidden={!leftButtonsRevealed}
              >
                <motion.button
                  type="button"
                  aria-label={bookmark.read ? "Mark as unread" : "Mark as read"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="group flex-1 flex items-center justify-center bg-muted text-foreground transition-colors duration-200 ease hover:bg-accent"
                  onClick={handleToggleReadClick}
                >
                  {bookmark.read ? (
                    <BookmarkIcon className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
                  ) : (
                    <BookCheck className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
                  )}
                </motion.button>
              </motion.div>

              <motion.div
                className="absolute right-0 top-0 bottom-0 flex"
                style={{
                  width: SWIPE.BUTTONS_WIDTH,
                  opacity: buttonsOpacity,
                  scale: buttonsScale,
                  pointerEvents: rightButtonsRevealed ? "auto" : "none",
                }}
                aria-hidden={!rightButtonsRevealed}
              >
                <motion.button
                  type="button"
                  aria-label="Edit bookmark"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="group flex-1 flex items-center justify-center bg-muted text-foreground transition-colors duration-200 ease hover:bg-accent"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(e);
                  }}
                >
                  <Pencil className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
                </motion.button>
                <motion.button
                  type="button"
                  aria-label="Delete bookmark"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                  className="group flex-1 flex items-center justify-center bg-destructive text-white transition-[color,background-color,filter] duration-200 ease hover:brightness-90"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                >
                  <Trash2 className="h-5 w-5 transition-transform duration-200 ease group-active:scale-95 motion-reduce:group-active:scale-100" />
                </motion.button>
              </motion.div>
            </>
          )}

          <div {...(isAuthenticated ? bind() : {})} style={{ touchAction: "pan-y" }}>
            <motion.div
              style={{ x }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              animate={{
                opacity: isDeleting ? 0.5 : 1,
              }}
              transition={SPRING_BOUNCY}
            >
              <div className="w-full py-3 px-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable="false"
                  className="flex items-start justify-between w-full gap-4 no-underline text-inherit select-none"
                  onClick={handleLinkClick}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="flex gap-3 flex-1 min-w-0">
                    {image && (
                      <img
                        src={image}
                        alt={`${host} favicon`}
                        className="w-6 h-6 flex-shrink-0"
                        draggable="false"
                      />
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <p
                        className="font-bold text-sm text-primary truncate transition-colors duration-200 ease px-1 -mx-1"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <span>{host}</span>
                        <span>·</span>
                        <span>{friendlyDate(createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

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
              <ContextMenuItem onClick={() => handleToggleRead()}>
                <BookmarkIcon className="h-4 w-4" />
                Mark as unread
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={() => handleToggleRead()}>
                <BookCheck className="h-4 w-4" />
                Mark as read
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => handleEdit()}>
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
