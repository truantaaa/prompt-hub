"use client";

import { cn } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/lib/types";

interface CategoryFilterProps {
  selected: Category | "all";
  onSelect: (category: Category | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const allCategories: { key: Category | "all"; label: string }[] = [
    { key: "all", label: "全部" },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            selected === cat.key
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
