import Link from "next/link";

import { tulocalIcons } from "@/components/icons";
import { Button } from "@/components/ui/button";

type StoreLinkProps = {
  handle: string;
};

export function StoreLink({ handle }: StoreLinkProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-sm"
      render={<Link href={`/${handle}`} />}
      nativeButton={false}
    >
      <tulocalIcons.store data-icon="inline-start" />
      Mi local
    </Button>
  );
}
