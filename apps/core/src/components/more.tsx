"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { tulocalIcons } from "@/components/icons";
import { Fold } from "@/components/motion/fold";
import { Swap } from "@/components/motion/swap";
import { Button } from "@/components/ui/button";

type MoreProps = {
  label: string;
  children: ReactNode;
};

export function More({ label, children }: MoreProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {isOpen ? "Ver menos" : label}
        <Swap activeKey={isOpen ? "open" : "closed"} data-icon="inline-end">
          {isOpen ? <tulocalIcons.chevronUp /> : <tulocalIcons.chevronDown />}
        </Swap>
      </Button>
      <Fold isOpen={isOpen}>{children}</Fold>
    </div>
  );
}
