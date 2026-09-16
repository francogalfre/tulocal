"use client";

import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Count } from "@/components/count";
import { countActiveFilters, DEFAULT_CATALOG_FILTERS } from "@/features/store/catalog";
import { FilterFields } from "@/features/store/filters/fields";
import type { CatalogCategory, CatalogFilters } from "@/features/store/catalog";

type FilterPanelProps = {
  filters: CatalogFilters;
  categories: CatalogCategory[];
  showStatus: boolean;
  onApply: (filters: CatalogFilters) => void;
};

type FilterActionsProps = {
  onClear: () => void;
  onApply: () => void;
};

function FilterActions({ onClear, onApply }: FilterActionsProps) {
  return (
    <>
      <Button variant="outline" size="xl" className="flex-1" onClick={onClear}>
        Limpiar todo
      </Button>
      <Button size="xl" className="flex-1" onClick={onApply}>
        Aplicar
      </Button>
    </>
  );
}

export function FilterPanel({ filters, categories, showStatus, onApply }: FilterPanelProps) {
  const [draft, setDraft] = useState(filters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function openWithFreshDraft(setOpen: (open: boolean) => void) {
    return (open: boolean): void => {
      if (open) {
        setDraft(filters);
      }

      setOpen(open);
    };
  }

  function applyDraft(): void {
    onApply(draft);
    setIsDrawerOpen(false);
    setIsSheetOpen(false);
  }

  function clearAll(): void {
    setDraft(DEFAULT_CATALOG_FILTERS);
    onApply(DEFAULT_CATALOG_FILTERS);
    setIsDrawerOpen(false);
    setIsSheetOpen(false);
  }

  const trigger = (
    <>
      <tulocalIcons.sliders />
      {activeCount > 0 ? (
        <Count
          count={activeCount}
          className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-deep font-heading text-xs font-semibold text-white"
        />
      ) : null}
    </>
  );

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={openWithFreshDraft(setIsDrawerOpen)}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            className="relative shrink-0 sm:hidden"
            aria-label="Filtros"
          >
            {trigger}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[88svh]">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">Filtros</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4">
            <FilterFields
              draft={draft}
              categories={categories}
              showStatus={showStatus}
              onDraftChange={setDraft}
            />
          </div>
          <DrawerFooter className="flex-row gap-3 border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
            <FilterActions onClear={clearAll} onApply={applyDraft} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Sheet open={isSheetOpen} onOpenChange={openWithFreshDraft(setIsSheetOpen)}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon-lg"
              className="relative hidden shrink-0 sm:inline-flex"
              aria-label="Filtros"
            />
          }
        >
          {trigger}
        </SheetTrigger>
        <SheetContent side="left" className="gap-0 data-[side=left]:sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-heading text-2xl">Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4">
            <FilterFields
              draft={draft}
              categories={categories}
              showStatus={showStatus}
              onDraftChange={setDraft}
            />
          </div>
          <SheetFooter className="flex-row gap-3 border-t">
            <FilterActions onClear={clearAll} onApply={applyDraft} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
