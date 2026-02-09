export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  url: string;
  host: string; // Computed from URL, not stored in DB
  title: string;
  image: string | null;
  category: Category | null;
  tags: Tag[];
  read: boolean;
  createdAt: string;
}

// Input types for creating/updating
export interface NewBookmarkInput {
  id: string;
  url: string;
  title: string;
  image?: string;
  createdAt: string;
}
