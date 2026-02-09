"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDndContext,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { GripVertical, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryListProps {
  categories: Category[];
  onReorder: (newOrder: Category[]) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryList({ categories, onReorder, onDelete }: CategoryListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === String(active.id));
    const newIndex = categories.findIndex((c) => c.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(categories, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={categories.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col">
          {categories.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

interface SortableCategoryItemProps {
  category: Category;
  onDelete: (category: Category) => void;
}

function SortableCategoryItem({ category, onDelete }: SortableCategoryItemProps) {
  const { active } = useDndContext();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const isDraggingOther = active && active.id !== category.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDraggingOther ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-2 text-base text-foreground relative transition-opacity duration-200 ease ${
        isDragging ? "z-50 bg-muted" : "bg-background"
      }`}
    >
      <motion.button
        type="button"
        aria-label={`Drag to reorder ${category.name}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        className={`touch-none -ml-1 p-1 rounded bg-muted hover:bg-theme-4 interactive-transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-foreground" />
      </motion.button>
      <span className="flex-1">{category.name}</span>
      <motion.button
        type="button"
        aria-label={`Delete ${category.name}`}
        tabIndex={0}
        onClick={() => onDelete(category)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        className="touch-none p-1 rounded bg-muted hover:bg-destructive/20 text-foreground hover:text-destructive interactive-transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Trash2 className="h-4 w-4" />
      </motion.button>
    </li>
  );
}
