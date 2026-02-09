"use client";

import React, { useState } from "react";
import { ArrowBigRight } from "lucide-react";
import { motion } from "motion/react";
import { useCategories } from "@/lib/hooks";
import { useSearch } from "@/lib/SearchContext";

export default function SideNav() {
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const { categories } = useCategories();
  const { selectedCategoryId, setSelectedCategoryId } = useSearch();

  if (categories.length === 0) {
    return null;
  }

  const activeNavIndex = selectedCategoryId === null 
    ? 0 
    : categories.findIndex((cat) => cat.id === selectedCategoryId) + 1;

  const arrowIndex = hoveredNavIndex ?? activeNavIndex ?? 0;

  const isAllActive = selectedCategoryId === null;

  return (
    <nav
      aria-label="Category navigation"
      className="sidenav w-32 flex-shrink-0 hidden md:block"
      onMouseLeave={() => setHoveredNavIndex(null)}
    >
      <div className="sticky top-8">
        <div className="flex flex-col relative">
          <motion.span
            className="absolute left-0 text-primary"
            initial={false}
            animate={{ y: arrowIndex * 36 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ top: 8 }}
            aria-hidden="true"
          >
            <ArrowBigRight className="h-4 w-4" />
          </motion.span>
          <motion.button
            type="button"
            aria-current={isAllActive ? "page" : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className={`text-sm text-left py-2 pl-5 transition-colors duration-200 ease ${
              isAllActive
                ? "text-primary font-bold"
                : "text-foreground hover:text-foreground"
            }`}
            onMouseEnter={() => setHoveredNavIndex(0)}
            onClick={() => setSelectedCategoryId(null)}
          >
            All
          </motion.button>
          {categories.map((cat, index) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
                className={`text-sm text-left py-2 pl-5 transition-colors duration-200 ease ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-foreground hover:text-foreground"
                }`}
                onMouseEnter={() => setHoveredNavIndex(index + 1)}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
