"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/hooks";
import type { Category } from "@/lib/types";

const NO_CATEGORY_VALUE = "__none__";

interface CategorySelectProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  /** If not provided, fetches categories automatically */
  categories?: Category[];
}

export default function CategorySelect({
  value,
  onChange,
  categories: categoriesProp,
}: CategorySelectProps) {
  const { categories: fetchedCategories } = useCategories();
  const categories = categoriesProp ?? fetchedCategories;

  function handleValueChange(newValue: string) {
    onChange(newValue === NO_CATEGORY_VALUE ? null : newValue);
  }

  return (
    <Select value={value ?? NO_CATEGORY_VALUE} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full h-12 text-base">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectItem value={NO_CATEGORY_VALUE}>
          <span className="text-foreground">No category</span>
        </SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
        {categories.length === 0 && (
          <div className="p-2 text-sm text-foreground text-center">
            No categories yet. Create one in settings.
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
