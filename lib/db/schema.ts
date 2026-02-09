import { sql, relations } from "drizzle-orm";
import { text, integer, sqliteTable, index, primaryKey } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    order: integer("order").notNull().default(0),
  },
  (table) => [index("categories_order_idx").on(table.order)]
);

export const bookmarks = sqliteTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    url: text("url").notNull().unique(),
    title: text("title").notNull(),
    image: text("image"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    read: integer("read").notNull().default(0),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("bookmarks_category_id_idx").on(table.categoryId),
    index("bookmarks_created_at_idx").on(table.createdAt),
  ]
);

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const bookmarkTags = sqliteTable(
  "bookmark_tags",
  {
    bookmarkId: text("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.bookmarkId, table.tagId] }),
    index("bookmark_tags_bookmark_id_idx").on(table.bookmarkId),
    index("bookmark_tags_tag_id_idx").on(table.tagId),
  ]
);// Relations for type-safe joins
export const bookmarksRelations = relations(bookmarks, ({ one, many }) => ({
  category: one(categories, {
    fields: [bookmarks.categoryId],
    references: [categories.id],
  }),
  bookmarkTags: many(bookmarkTags),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  bookmarkTags: many(bookmarkTags),
}));

export const bookmarkTagsRelations = relations(bookmarkTags, ({ one }) => ({
  bookmark: one(bookmarks, {
    fields: [bookmarkTags.bookmarkId],
    references: [bookmarks.id],
  }),
  tag: one(tags, {
    fields: [bookmarkTags.tagId],
    references: [tags.id],
  }),
}));