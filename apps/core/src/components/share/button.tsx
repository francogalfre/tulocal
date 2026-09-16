"use client";

import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { tulocalIcons } from "@/components/icons";
import { Swap } from "@/components/motion/swap";
import {
  EASE_OUT_EXPO,
  STAGGER_STEP_IN_SECONDS,
  STATE_DURATION_IN_SECONDS,
} from "@/lib/motion/timing";

const COPIED_FEEDBACK_IN_MILLISECONDS = 2000;

const SHARE_MESSAGE = "Mirá lo que estoy vendiendo en tulocal";

const ACTION_OFFSET_IN_PIXELS = 42;

const TRIGGER_CLASSES =
  "relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const ACTION_CLASSES =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type ShareActionProps = {
  index: number;
  label: string;
  directionSign: number;
  onSelect: () => void;
  icon: ReactNode;
  href?: string;
};

function ShareAction({ index, label, directionSign, onSelect, icon, href }: ShareActionProps) {
  const stackedOffset = -directionSign * ACTION_OFFSET_IN_PIXELS * (index + 1);
  const transition = {
    duration: STATE_DURATION_IN_SECONDS,
    ease: EASE_OUT_EXPO,
    delay: index * STAGGER_STEP_IN_SECONDS,
  };

  if (href !== undefined) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        onClick={onSelect}
        initial={{ opacity: 0, x: stackedOffset, scale: 0.5 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: stackedOffset, scale: 0.5 }}
        transition={transition}
        className={ACTION_CLASSES}
      >
        {icon}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onSelect}
      initial={{ opacity: 0, x: stackedOffset, scale: 0.5 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: stackedOffset, scale: 0.5 }}
      transition={transition}
      className={ACTION_CLASSES}
    >
      {icon}
    </motion.button>
  );
}

type ShareButtonProps = {
  url: string;
  direction?: "left" | "right";
  label?: string;
  className?: string;
};

export function ShareButton({
  url,
  direction = "right",
  label = "Compartir",
  className,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const directionSign = direction === "right" ? 1 : -1;

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent): void {
      const root = rootRef.current;

      if (root !== null && !event.composedPath().includes(root)) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_IN_MILLISECONDS);
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGE}: ${url}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(SHARE_MESSAGE)}`;

  return (
    <span ref={rootRef} className={cn("relative inline-flex items-center", className)}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={label}
        whileTap={{ scale: 0.94 }}
        className={TRIGGER_CLASSES}
      >
        <Swap activeKey={isOpen ? "close" : "share"}>
          {isOpen ? (
            <tulocalIcons.close className="size-5" />
          ) : (
            <tulocalIcons.share className="size-5" />
          )}
        </Swap>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            key="actions"
            className={cn(
              "absolute inset-y-0 z-0 flex items-center gap-1.5",
              direction === "right" ? "left-full pl-1.5" : "right-full flex-row-reverse pr-1.5",
            )}
          >
            <ShareAction
              index={0}
              label={isCopied ? "Link copiado" : "Copiar link"}
              directionSign={directionSign}
              onSelect={handleCopy}
              icon={
                <Swap activeKey={isCopied ? "copied" : "copy"}>
                  {isCopied ? (
                    <tulocalIcons.check className="size-4" />
                  ) : (
                    <tulocalIcons.copy className="size-4" />
                  )}
                </Swap>
              }
            />
            <ShareAction
              index={1}
              label="Compartir por WhatsApp"
              directionSign={directionSign}
              onSelect={close}
              href={whatsappUrl}
              icon={<tulocalIcons.whatsapp className="size-4" />}
            />
            <ShareAction
              index={2}
              label="Compartir en X"
              directionSign={directionSign}
              onSelect={close}
              href={twitterUrl}
              icon={<tulocalIcons.xLogo className="size-4" />}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
