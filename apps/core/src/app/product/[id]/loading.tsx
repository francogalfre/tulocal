import { Skeleton } from "@/components/ui/skeleton";
import { Screen } from "@/components/screen";

export default function ProductLoading() {
  return (
    <Screen aside={<Skeleton className="h-8 w-24" />}>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="col-span-2 row-span-2 aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="aspect-square rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </Screen>
  );
}
