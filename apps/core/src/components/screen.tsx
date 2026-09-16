import type { ReactNode } from "react";

import { Logo } from "@/components/logo";

type ScreenProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function Screen({ children, aside }: ScreenProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-10 px-5 pt-6 pb-12">
      <header className="flex h-8 items-center justify-between">
        <Logo />
        {aside}
      </header>
      <div className="flex flex-1 flex-col gap-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out">
        {children}
      </div>
    </main>
  );
}
