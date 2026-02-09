"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import DockBar from "@/components/DockBar";
import BookmarksDialogs from "@/components/BookmarksDialogs";
import { SearchProvider } from "@/lib/SearchContext";

type DockDialogType = "add" | "categories";

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeDialog, setActiveDialog] = useState<DockDialogType | null>(null);

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
        <DockBar
          onOpenAdd={() => setActiveDialog((prev) => (prev === "add" ? null : "add"))}
          onOpenCategories={() => setActiveDialog((prev) => (prev === "categories" ? null : "categories"))}
        />
      </div>
      <BookmarksDialogs
        active={activeDialog}
        onClose={() => setActiveDialog(null)}
      />
    </SearchProvider>
  );
}
