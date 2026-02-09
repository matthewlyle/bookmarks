"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full border border-input bg-background text-foreground placeholder:text-foreground transition-[color,background-color,border-color,box-shadow] duration-200 ease focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium file:text-foreground",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const Input = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>
>(({ className, type, size, ...props }, ref) => {
  return (
    <input type={type} className={cn(inputVariants({ size, className }))} ref={ref} {...props} />
  );
});
Input.displayName = "Input";

export { Input, inputVariants };
