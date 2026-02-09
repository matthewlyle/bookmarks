"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, LogOut, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCategories, refetchData } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategoryList from "@/components/CategoryList";
import ColorThemePicker from "@/components/ColorThemePicker";
import { UNDO_DELAY_MS } from "@/lib/constants";
import type { Category } from "@/lib/types";

export default function SettingsPage() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [localCategories, setLocalCategories] = useState<Category[]>([]);

  const { categories, isLoading } = useCategories();

  useEffect(() => {
    if (!isLoading) setLocalCategories(categories);
  }, [isLoading, categories]);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      setNewCategoryName("");
      await refetchData();
      toast.success("Category created");
    } catch (error) {
      toast.error("Failed to create category", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsAdding(false);
    }
  }

  function handleDeleteCategory(category: Category) {
    setLocalCategories((prev) => prev.filter((c) => c.id !== category.id));

    let deleted = false;
    const deleteTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/categories/${encodeURIComponent(category.slug)}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete category");

        deleted = true;
        refetchData();
      } catch (error) {
        refetchData();
        toast.error("Failed to delete category", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }, UNDO_DELAY_MS);

    toast.success("Category deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          if (!deleted) {
            clearTimeout(deleteTimeout);
            refetchData();
          }
        },
      },
    });
  }

  async function handleReorder(newOrder: Category[]) {
    setLocalCategories(newOrder);

    try {
      const response = await fetch("/api/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: newOrder.map((c) => c.id) }),
      });

      if (!response.ok) throw new Error("Failed to reorder categories");

      refetchData();
    } catch (error) {
      setLocalCategories(categories);
      toast.error("Failed to reorder categories", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };

  return (
    <div className="py-8 px-4 min-h-[200px] pb-24">
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
          <motion.div key="content" {...fadeIn} className="space-y-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Settings</h2>
            <section>
              <h2 className="text-sm font-medium text-foreground mb-3">Categories</h2>
              <form onSubmit={handleAddCategory} className="mb-4">
                <div className="flex items-stretch gap-2">
                  <Input
                    type="text"
                    size="lg"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isAdding || !newCategoryName.trim()} className="h-12">
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </form>

              {localCategories.length === 0 ? (
                <p className="text-foreground text-center py-4">No categories yet.</p>
              ) : (
                <CategoryList
                  categories={localCategories}
                  onReorder={handleReorder}
                  onDelete={handleDeleteCategory}
                />
              )}
            </section>

            <section className="border-t border-border pt-6">
              <h2 className="text-sm font-medium text-foreground mb-3">Appearance</h2>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-foreground">Theme</span>
                <ColorThemePicker />
              </div>
            </section>

            <section className="border-t border-border pt-6">
              <h2 className="text-sm font-medium text-foreground mb-3">Account</h2>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/auth" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
