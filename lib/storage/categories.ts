import { eq, asc, max } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/schema";
import type { Category } from "../types";
import { NotFoundError, ValidationError, DatabaseError } from "../errors";
import { generateSlug } from "./utils";

export type { Category };

// Get all categories
export async function getCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(asc(categories.order));
}

// Create a new category
// Uses a transaction to ensure atomicity between max order lookup and insert
export async function createCategory(name: string): Promise<Category> {
  const normalized = name.trim();
  if (!normalized) {
    throw new ValidationError("Category name cannot be empty");
  }

  const slug = generateSlug(normalized);
  if (!slug) {
    throw new ValidationError("Category name must contain alphanumeric characters");
  }

  try {
    const category = await db.transaction(async (tx) => {
      // Get the max order value to place new category at the end
      const [{ maxOrder }] = await tx
        .select({ maxOrder: max(categories.order) })
        .from(categories);
      const newOrder = (maxOrder ?? -1) + 1;

      const [newCategory] = await tx
        .insert(categories)
        .values({ id: crypto.randomUUID(), name: normalized, slug, order: newOrder })
        .returning();
      return newCategory;
    });
    return category;
  } catch (error) {
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new ValidationError("A category with this name already exists");
    }
    throw new DatabaseError("Failed to create category", error instanceof Error ? error : undefined);
  }
}

// Rename a category
export async function renameCategory(oldSlug: string, newName: string): Promise<Category> {
  const normalized = newName.trim();
  if (!normalized) {
    throw new ValidationError("Category name cannot be empty");
  }

  const newSlug = generateSlug(normalized);
  if (!newSlug) {
    throw new ValidationError("Category name must contain alphanumeric characters");
  }

  try {
    const [category] = await db
      .update(categories)
      .set({ name: normalized, slug: newSlug })
      .where(eq(categories.slug, oldSlug))
      .returning();

    if (!category) {
      throw new NotFoundError("Category", oldSlug);
    }
    return category;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      throw new ValidationError("A category with this name already exists");
    }
    throw new DatabaseError("Failed to rename category", error instanceof Error ? error : undefined);
  }
}

// Delete a category (bookmarks will have categoryId set to null due to onDelete: "set null")
export async function deleteCategory(slug: string): Promise<void> {
  const result = await db.delete(categories).where(eq(categories.slug, slug));
  if (result.rowsAffected === 0) {
    throw new NotFoundError("Category", slug);
  }
}

// Reorder categories by updating their order values
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) {
    return;
  }

  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(categories)
          .set({ order: i })
          .where(eq(categories.id, orderedIds[i]));
      }
    });
  } catch (error) {
    throw new DatabaseError(
      "Failed to reorder categories",
      error instanceof Error ? error : undefined
    );
  }
}
