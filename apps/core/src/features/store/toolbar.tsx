"use client";

import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Count } from "@/components/count";
import { serializeCatalogFilters } from "@/features/store/catalog";
import { FilterPanel } from "@/features/store/filters/panel";
import type { CatalogCategory, CatalogFilters } from "@/features/store/catalog";

type CatalogToolbarProps = {
  filters: CatalogFilters;
  categories: CatalogCategory[];
  showStatus: boolean;
};

function toggleCategory(categories: string[], category: string): string[] {
  if (categories.includes(category)) {
    return categories.filter((existing) => existing !== category);
  }

  return [...categories, category];
}

export function CatalogToolbar({ filters, categories, showStatus }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(next: CatalogFilters): void {
    const query = serializeCatalogFilters(next);

    router.replace(query.length === 0 ? pathname : `${pathname}?${query}`, { scroll: false });
  }

  return (
    <div className="-mx-5 flex items-center gap-3 overflow-x-auto px-5 py-1 [scrollbar-width:none]">
      <FilterPanel
        filters={filters}
        categories={categories}
        showStatus={showStatus}
        onApply={navigate}
      />
      {categories.length > 0 ? <Separator orientation="vertical" className="h-6 shrink-0" /> : null}
      {categories.map((category) => (
        <Toggle
          key={category.name}
          variant="outline"
          size="lg"
          className="h-11 shrink-0 gap-2 rounded-full pr-3 pl-1.5"
          pressed={filters.category.includes(category.name)}
          onPressedChange={() =>
            navigate({ ...filters, category: toggleCategory(filters.category, category.name) })
          }
        >
          <Avatar className="size-8">
            {category.coverUrl !== null ? <AvatarImage src={category.coverUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">
              {category.label.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{category.label}</span>
          <Count count={category.count} className="text-xs text-muted-foreground" />
        </Toggle>
      ))}
    </div>
  );
}
