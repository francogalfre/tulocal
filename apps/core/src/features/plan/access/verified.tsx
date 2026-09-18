"use client";

import { cn } from "cn";
import { useState } from "react";

import { tulocalIcons } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type VerifiedProps = {
  planName: string;
  className?: string;
};

export function Verified({ planName, className }: VerifiedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const label = `Local ${planName}`;

  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger
        render={<span />}
        delay={0}
        aria-label={label}
        onClick={() => setIsOpen(true)}
        className={cn(
          "relative inline-flex shrink-0 cursor-default items-center justify-center",
          className,
        )}
      >
        <tulocalIcons.checkBadge
          className="size-full fill-verified text-verified"
          aria-hidden="true"
        />
        <tulocalIcons.check
          className="absolute size-1/2 text-white"
          strokeWidth={3}
          aria-hidden="true"
        />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
