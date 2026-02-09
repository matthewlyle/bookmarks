"use client";

import { useState, useEffect } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategorySelect from "@/components/CategorySelect";
import { Loader2 } from "lucide-react";
import type { Bookmark } from "@/lib/types";

interface EditBookmarkDialogProps {
  bookmark: Bookmark | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: { title: string; categoryId: string | null }) => Promise<void>;
}

export default function EditBookmarkDialog({
  bookmark,
  open,
  onOpenChange,
  onSave,
}: EditBookmarkDialogProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (bookmark && open) {
      setTitle(bookmark.title);
      setCategoryId(bookmark.category?.id ?? null);
    }
  }, [bookmark, open]);

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!bookmark) return;

    setIsSaving(true);
    try {
      await onSave(bookmark.id, { title, categoryId });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    onOpenChange(false);
  }

  if (!bookmark) return null;

  return (
    <DialogContent open={open} onOpenChange={onOpenChange} title="Edit" onOpenAutoFocus={(e) => e.preventDefault()}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL
            </label>
            <Input id="url" type="text" value={bookmark.url} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
