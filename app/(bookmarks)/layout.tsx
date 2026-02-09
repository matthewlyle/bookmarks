"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import BottomBar from "@/components/BottomBar";
import AddBookmarkDialog from "@/components/dialogs/AddBookmarkDialog";
import CategoriesDialog from "@/components/dialogs/CategoriesDialog";
import { SearchProvider } from "@/lib/SearchContext";

type DialogType = "add" | "categories";

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeDialog, setActiveDialog] = useState<DialogType | null>(null);

  useEffect(() => {
    setActiveDialog(null);
  }, [pathname]);

  return (
    <SearchProvider>
      <div className="bookmarks-layout min-h-screen flex flex-col">
        <Header title="bookmarks" />
        <div className="container mx-auto max-w-4xl flex-1">
          {children}
        </div>
        <BottomBar
          onOpenAdd={() => setActiveDialog((prev) => (prev === "add" ? null : "add"))}
          onOpenCategories={() => setActiveDialog((prev) => (prev === "categories" ? null : "categories"))}
        />
      </div>
      <AddBookmarkDialog
        open={activeDialog === "add"}
        onClose={() => setActiveDialog(null)}
      />
      <CategoriesDialog
        open={activeDialog === "categories"}
        onClose={() => setActiveDialog(null)}
      />
    </SearchProvider>
  );
}
