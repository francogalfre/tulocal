import { Store } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type StoreLinkProps = {
  handle: string;
};

export function StoreLink({ handle }: StoreLinkProps) {
  return (
    <Button variant="ghost" size="sm" render={<Link href={`/${handle}`} />} nativeButton={false}>
      <Store data-icon="inline-start" />
      Mi tienda
    </Button>
  );
}
