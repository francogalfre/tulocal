import { Spinner } from "@tulocal/ui/components/spinner";

export function ScreenLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-5 text-muted-foreground" />
    </div>
  );
}
