"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const isSearching = searchQuery.length > 0;

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      clearSearch, 
      isSearching,
      selectedCategoryId,
      setSelectedCategoryId,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
