"use client";

import { cn } from "@/lib/utils";
import { Category } from "@/types/api";

interface CategoryChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  category: Category;
  isActive?: boolean;
}

export function CategoryChip({ category, isActive, className, ...props }: CategoryChipProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "border-vault-gold bg-vault-gold text-vault-surface"
          : "border-border bg-vault-elevated text-foreground hover:border-vault-gold/50 hover:bg-vault-elevated/80",
        className
      )}
      {...props}
    >
      {category.name}
    </button>
  );
}
