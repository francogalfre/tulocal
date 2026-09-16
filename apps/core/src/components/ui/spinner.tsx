import { cn } from "cn";

import { tulocalIcons } from "@/components/icons";

function Spinner({ className, ...props }: React.ComponentProps<typeof tulocalIcons.spinner>) {
  return (
    <tulocalIcons.spinner
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
