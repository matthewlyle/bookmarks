"use client";

import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBookmark } from "@/lib/api";
import { refetchData } from "@/lib/hooks";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategorySelect from "@/components/CategorySelect";

interface AddBookmarkDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddBookmarkDialog({ open, onClose }: AddBookmarkDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error("URL is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBookmark(trimmedUrl, undefined, categoryId ?? undefined);
      await refetchData();
      toast.success("Bookmark saved");
      setUrl("");
      setCategoryId(null);
      onClose();
    } catch (error) {
      toast.error("Failed to save bookmark", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DialogContent
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Add"
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          type="url"
          size="lg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <CategorySelect value={categoryId} onChange={setCategoryId} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !url.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
