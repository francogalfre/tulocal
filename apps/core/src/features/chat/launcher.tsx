"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AgentFace } from "@/features/agent/face";
import type { AgentVoice } from "@/features/agent/voice";
import { cn } from "@/lib/utils";

const TRIGGER_FACE_SIZE_IN_PIXELS = 32;

type LauncherProps = {
  agentName: string;
  agentSeed: string;
  agentVoice: AgentVoice;
  hasHistory: boolean;
  children: ReactNode;
};

export function Launcher({
  agentName,
  agentSeed,
  agentVoice,
  hasHistory,
  children,
}: LauncherProps) {
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
    <Drawer open={isOpen} onOpenChange={handleOpenChange} repositionInputs={false}>
      <DrawerTrigger
        className={cn(buttonVariants({ size: "xl" }), "h-14 has-data-[icon=inline-start]:pl-2")}
      >
        <span
          data-icon="inline-start"
          className="flex rounded-full bg-background p-0.5 ring-1 ring-primary-foreground/40"
        >
          <AgentFace
            seed={agentSeed}
            voice={agentVoice}
            name={agentName}
            sizeInPixels={TRIGGER_FACE_SIZE_IN_PIXELS}
            isThinking={false}
            animate="always"
          />
        </span>
        {label}
      </DrawerTrigger>
      <DrawerContent className="bottom-(--visual-viewport-bottom-inset) h-[calc(var(--visual-viewport-height)*5/6)]">
        <DrawerTitle className="sr-only">Chat con {agentName}</DrawerTitle>
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-5 pt-4 pb-5">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
