"use client";

import { MessagesSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type LauncherProps = {
  agentName: string;
  hasHistory: boolean;
  children: ReactNode;
};

export function Launcher({ agentName, hasHistory, children }: LauncherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const label = hasHistory ? `Seguir hablando con ${agentName}` : `Hablar con ${agentName}`;

  function handleOpenChange(nextOpen: boolean): void {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      router.refresh();
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger className={cn(buttonVariants({ size: "xl" }))}>
        <MessagesSquare data-icon="inline-start" />
        {label}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Chat con {agentName}</DrawerTitle>
        <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-5 pt-4 pb-5">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
