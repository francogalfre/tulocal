import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";

const CATALOG_PLACEHOLDER_COUNT = 4;

const catalogPlaceholders = Array.from({ length: CATALOG_PLACEHOLDER_COUNT }, (_, index) => index);

export default function StoreLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </header>
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-[3/1] w-full rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
        {catalogPlaceholders.map((placeholder) => (
          <li key={placeholder} className="flex flex-col gap-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </li>
        ))}
      </ul>
    </main>
  );
}
