import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";

const STORE_PLACEHOLDER_COUNT = 4;

const storePlaceholders = Array.from({ length: STORE_PLACEHOLDER_COUNT }, (_, index) => index);

export default function StoresLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col lg:border-x">
      <main className="flex flex-1 flex-col gap-10 px-6 pt-6 pb-24">
        <header className="flex h-9 items-center justify-between">
          <Logo />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </header>
        <div className="flex flex-col gap-6 pt-6">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {storePlaceholders.map((placeholder) => (
            <li key={placeholder} className="flex flex-col gap-3">
              <Skeleton className="aspect-[3/1] rounded-2xl" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
