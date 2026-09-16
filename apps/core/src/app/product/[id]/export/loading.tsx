import { Skeleton } from "@/components/ui/skeleton";
import { Screen } from "@/components/screen";

export default function ProductExportLoading() {
  return (
    <Screen aside={<Skeleton className="h-8 w-24" />}>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="aspect-[9/16] w-full max-w-xs rounded-xl" />
    </Screen>
  );
}
