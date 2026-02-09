"use client";

import { useRef } from "react";
import { DialogContent } from "@/components/ui/dialog";
import { AddBookmarkForm, CategoriesPanel } from "@/components/dock";

const panelTitles: Record<"add" | "categories", string> = {
  add: "Add",
  categories: "Categories",
};

interface BookmarksDialogsProps {
  active: "add" | "categories" | null;
  onClose: () => void;
}

export default function BookmarksDialogs({ active, onClose }: BookmarksDialogsProps) {
  const addFormInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <DialogContent
        open={active === "add"}
        onOpenChange={(open) => !open && onClose()}
        title={panelTitles.add}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          requestAnimationFrame(() => addFormInputRef.current?.focus());
        }}
      >
        <AddBookmarkForm onClose={onClose} inputRef={addFormInputRef} />
      </DialogContent>
      <DialogContent
        open={active === "categories"}
        onOpenChange={(open) => !open && onClose()}
        title={panelTitles.categories}
      >
        <CategoriesPanel onClose={onClose} />
      </DialogContent>
    </>
  );
}
