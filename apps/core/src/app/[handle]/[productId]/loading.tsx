import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";

export default function PublicProductLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 pt-6 pb-16">
      <header className="flex h-9 items-center justify-between">
        <Logo />
        <Skeleton className="h-8 w-28" />
      </header>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="col-span-2 row-span-2 aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </main>
  );
}
