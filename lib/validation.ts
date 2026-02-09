import { z } from "zod";

// Reusable schemas
export const uuidSchema = z.string().uuid("Invalid UUID format");
export const urlSchema = z.string().url("Invalid URL format").max(2048, "URL too long");
export const titleSchema = z.string().min(1, "Title is required").max(500, "Title too long");
export const categoryNameSchema = z
  .string()
  .min(1, "Category name is required")
  .max(100, "Category name too long");

// Request body schemas
export const createBookmarkSchema = z.object({
  url: urlSchema,
  title: titleSchema.optional(),
  categoryId: uuidSchema.nullable().optional(),
});

export const updateBookmarkSchema = z.object({
  title: titleSchema.optional(),
  categoryId: uuidSchema.nullable().optional(),
  tagIds: z.array(uuidSchema).optional(),
  read: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const renameCategorySchema = z.object({
  newName: categoryNameSchema,
});

export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(uuidSchema).min(1, "At least one category ID required"),
});

export const tagNameSchema = z
  .string()
  .min(1, "Tag name is required")
  .max(50, "Tag name too long");

export const createTagSchema = z.object({
  name: tagNameSchema,
});

// Types inferred from schemas
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type RenameCategoryInput = z.infer<typeof renameCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;

// Helper to parse and validate request bodies
export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success === false) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue.path.length > 0 ? `${firstIssue.path.join(".")}: ` : "";
    return { success: false, error: `${path}${firstIssue.message}` };
  }
  return { success: true, data: result.data };
}
