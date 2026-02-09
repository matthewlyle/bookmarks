"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useCategories } from "@/lib/hooks";
import { useSearch } from "@/lib/SearchContext";

interface CategoriesPanelProps {
  onClose: () => void;
}

export default function CategoriesPanel({ onClose }: CategoriesPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { categories, isLoading } = useCategories();
  const { selectedCategoryId, setSelectedCategoryId } = useSearch();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-foreground" />
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="text-foreground text-center py-2">No categories yet.</p>;
  }

  function handleSelect(categoryId: string | null) {
    setSelectedCategoryId(categoryId);
    onClose();
    if (pathname !== "/") {
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={() => handleSelect(null)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        className={`text-base py-2 transition-colors duration-200 ease hover:text-primary ${
          selectedCategoryId === null ? "text-primary font-bold" : "text-foreground"
        }`}
      >
        All
      </motion.button>
      {categories.map((category) => (
        <motion.button
          key={category.id}
          type="button"
          onClick={() => handleSelect(category.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          className={`text-base py-2 transition-colors duration-200 ease hover:text-primary ${
            selectedCategoryId === category.id ? "text-primary font-bold" : "text-foreground"
          }`}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
}
